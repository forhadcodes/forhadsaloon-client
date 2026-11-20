"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/text-area"
import { ApiRequestError, adminServicesApi } from "@/lib/api"
import { CATEGORIES, SERVICE_STATUS } from "@/lib/constants"
import type { Service } from "@/lib/types"
import { uploadImage } from "@/lib/upload"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const serviceSchema = z.object({
  serviceName: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters.")
    .max(100, "Service name must be 100 characters or fewer."),
  category: z
    .string()
    .refine((value) => (CATEGORIES as readonly string[]).includes(value), "Please choose a category."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must be 1000 characters or fewer."),
  price: z.coerce
    .number({ error: "Enter a valid price." })
    .positive("Price must be greater than 0.")
    .finite("Enter a valid price."),
  duration: z.coerce
    .number({ error: "Enter a valid duration." })
    .int("Duration must be a whole number of minutes.")
    .positive("Duration must be greater than 0."),
  image: z
    .string()
    .url("Please upload a service image.")
    .refine((value) => value.startsWith("https://"), "Image must be a secure (https) URL."),
  status: z.enum(SERVICE_STATUS),
})

type ServiceFormInput = z.input<typeof serviceSchema>
type ServiceFormValues = z.output<typeof serviceSchema>

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormInput, unknown, ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: "onBlur",
    defaultValues: {
      serviceName: service?.serviceName ?? "",
      category: service?.category ?? "",
      description: service?.description ?? "",
      price: service?.price ?? 0,
      duration: service?.duration ?? 0,
      image: service?.image ?? "",
      status: service?.status ?? "active",
    },
  })

  const busy = isSubmitting || uploading
  const previewSrc = preview ?? service?.image ?? null

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const url = await uploadImage(file, false)
    setUploading(false)
    if (!url) return

    setValue("image", url, { shouldValidate: true, shouldDirty: true })
    setPreview(URL.createObjectURL(file))
    toast.success("Image uploaded.")
  }

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      if (service) {
        await adminServicesApi.update(service.id, values)
        toast.success("Service updated successfully.")
      } else {
        await adminServicesApi.create(values)
        toast.success("Service created successfully.")
      }

      router.push("/dashboard/admin/services")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof ApiRequestError ? error.message : "Could not save the service. Please try again.",
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-salon space-y-5 p-4 sm:p-6">
      <div>
        <label htmlFor="service-name" className="mb-1 block text-sm font-medium">
          Service Name
        </label>
        <Input
          id="service-name"
          placeholder="e.g. Classic Haircut"
          aria-invalid={Boolean(errors.serviceName)}
          {...register("serviceName")}
        />
        {errors.serviceName && <p className="mt-1 text-sm text-error">{errors.serviceName.message}</p>}
      </div>

      <Controller
        control={control}
        name="category"
        render={({ field, fieldState }) => (
          <Select
            id="service-category"
            label="Category"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <Textarea
            id="service-description"
            label="Description"
            rows={4}
            placeholder="Describe this service for your customers"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service-price" className="mb-1 block text-sm font-medium">
            Price (USD)
          </label>
          <Input
            id="service-price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="45.00"
            aria-invalid={Boolean(errors.price)}
            {...register("price")}
          />
          {errors.price && <p className="mt-1 text-sm text-error">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="service-duration" className="mb-1 block text-sm font-medium">
            Estimated Duration (minutes)
          </label>
          <Input
            id="service-duration"
            type="number"
            step="1"
            min="1"
            placeholder="60"
            aria-invalid={Boolean(errors.duration)}
            {...register("duration")}
          />
          {errors.duration && <p className="mt-1 text-sm text-error">{errors.duration.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="service-image-file" className="mb-1 block text-sm font-medium">
          Service Image
        </label>
        <p className="mb-2 text-sm text-base-content/60">
          Upload a JPG, PNG or WebP image (max 5 MB). This image is shown to customers.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="shrink-0">
            {previewSrc ? (
              <Image
                src={previewSrc}
                alt="Service image preview"
                width={160}
                height={120}
                unoptimized
                className="size-40 rounded-xl border border-base-300 object-cover"
              />
            ) : (
              <div className="flex size-40 items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-200 text-center text-sm text-base-content/50">
                No image selected
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              id="service-image-file"
              name="file"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              aria-label="Service image file"
              disabled={uploading}
              onChange={(event) => void handleFileChange(event)}
              className="min-h-11 w-full rounded-xl border border-base-300 bg-base-100 p-2 text-sm"
            />
            {uploading && (
              <p className="mt-2 flex items-center gap-2 text-sm text-base-content/70">
                <Spinner /> Uploading image...
              </p>
            )}
            {errors.image && <p className="mt-1 text-sm text-error">{errors.image.message}</p>}
          </div>
        </div>
      </div>

      <Controller
        control={control}
        name="status"
        render={({ field, fieldState }) => (
          <Select
            id="service-status"
            label="Service Status"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        )}
      />

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} disabled={busy}>
          {isSubmitting ? "Saving service..." : service ? "Save Changes" : "Create Service"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy}
          onClick={() => router.push("/dashboard/admin/services")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
