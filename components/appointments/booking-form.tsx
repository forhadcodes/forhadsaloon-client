"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useRef, useState, type ChangeEvent } from "react"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/text-area"
import { ApiRequestError, appointmentsApi, type CreateAppointmentInput } from "@/lib/api"
import { SALON_TIMEZONE, TIME_SLOTS } from "@/lib/constants"

const bookingSchema = z.object({
  appointmentDate: z
    .string()
    .min(1, "Please choose an appointment date.")
    .refine(
      (value) => !value || value >= todayInSalonTimezone(),
      "Appointment date must be today or later.",
    ),
  timeSlot: z
    .string()
    .min(1, "Please choose a time slot.")
    .refine(
      (value) => !value || (TIME_SLOTS as readonly string[]).includes(value),
      "Please choose a valid time slot.",
    ),
  message: z.string().max(500, "Your message must be 500 characters or less.").optional(),
})

type BookingValues = z.infer<typeof bookingSchema>

/** YYYY-MM-DD in the salon's time zone, built from parts to avoid locale formatting drift. */
function todayInSalonTimezone(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SALON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

export function BookingForm({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const today = todayInSalonTimezone()

  const [takenSlots, setTakenSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const requestId = useRef(0)

  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { appointmentDate: "", timeSlot: "", message: "" },
  })

  const appointmentDate = useWatch({ control, name: "appointmentDate" }) ?? ""
  const selectedSlot = useWatch({ control, name: "timeSlot" }) ?? ""
  const message = useWatch({ control, name: "message" }) ?? ""
  const dateIsValid = Boolean(appointmentDate) && appointmentDate >= today

  async function loadAvailability(date: string) {
    const currentRequest = ++requestId.current
    setSlotsLoading(true)
    setTakenSlots([])

    try {
      const data = await appointmentsApi.availability(date)
      if (currentRequest !== requestId.current) return

      const taken = data.takenSlots ?? []
      setTakenSlots(taken)
      if (taken.includes(getValues("timeSlot"))) {
        setValue("timeSlot", "", { shouldValidate: true })
      }
    } catch (err) {
      if (currentRequest !== requestId.current) return
      if (err instanceof ApiRequestError && err.status === 0) return
      toast.error(
        err instanceof ApiRequestError ? err.message : "Could not load available time slots.",
      )
    } finally {
      if (currentRequest === requestId.current) setSlotsLoading(false)
    }
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDate = event.target.value
    setValue("appointmentDate", nextDate, { shouldValidate: true })

    requestId.current += 1
    setTakenSlots([])
    setSlotsLoading(false)
    setValue("timeSlot", "", { shouldValidate: true })

    if (nextDate && nextDate >= today) void loadAvailability(nextDate)
  }

  async function onSubmit(values: BookingValues) {
    const payload: CreateAppointmentInput = {
      serviceId,
      appointmentDate: values.appointmentDate,
      timeSlot: values.timeSlot,
      message: values.message?.trim() ? values.message.trim() : undefined,
    }

    try {
      await appointmentsApi.create(payload)
      toast.success("Appointment request submitted successfully.")
      router.push("/dashboard/customer/appointments")
      router.refresh()
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 409) {
        toast.error(err.message)
        setValue("timeSlot", "", { shouldValidate: true })
        void loadAvailability(values.appointmentDate)
        return
      }
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "Could not submit your appointment request. Please try again.",
      )
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      className="grid gap-5 sm:grid-cols-2"
      noValidate
    >
      <div>
        <Label htmlFor="appointment-date">Appointment Date</Label>
        <Input
          id="appointment-date"
          type="date"
          min={today}
          value={appointmentDate}
          onChange={handleDateChange}
          aria-invalid={Boolean(errors.appointmentDate)}
          aria-describedby={errors.appointmentDate ? "appointment-date-error" : undefined}
          className="mt-1"
        />
        {errors.appointmentDate ? (
          <p id="appointment-date-error" className="mt-1 text-sm text-error">
            {errors.appointmentDate.message}
          </p>
        ) : null}
      </div>

      <Select
        label="Available Time Slot"
        error={errors.timeSlot?.message}
        value={selectedSlot}
        disabled={slotsLoading || !dateIsValid}
        onChange={(event) => setValue("timeSlot", event.target.value, { shouldValidate: true })}
      >
        <option value="">
          {slotsLoading
            ? "Loading available slots..."
            : !dateIsValid
              ? "Choose a date first"
              : "Select a time slot"}
        </option>
        {TIME_SLOTS.map((slot) => {
          const taken = takenSlots.includes(slot)
          return (
            <option key={slot} value={slot} disabled={taken}>
              {taken ? `${slot} (Booked)` : slot}
            </option>
          )
        })}
      </Select>

      <div className="sm:col-span-2">
        <Textarea
          label="Additional Message (optional)"
          error={errors.message?.message}
          value={message}
          onChange={(event) => setValue("message", event.target.value, { shouldValidate: true })}
          maxLength={500}
          rows={4}
          placeholder="Anything the salon should know before your visit?"
        />
      </div>

      <div className="sm:col-span-2">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          loading={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Creating appointment request..." : "Submit Request"}
        </Button>
      </div>
    </form>
  )
}
