"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiRequestError, profileApi } from "@/lib/api"
import { authClient, useSession } from "@/lib/auth-client"
import { uploadImage } from "@/lib/upload"
import { cn } from "@/lib/utils"

const HTTPS_URL = /^https:\/\/\S+$/i
const PHONE_PATTERN = /^[+]?[\d\s()-]{7,20}$/
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be 60 characters or fewer."),
  image: z
    .string()
    .refine(
      (value) => value.trim() === "" || HTTPS_URL.test(value.trim()),
      "Enter a valid https image URL.",
    ),
  phone: z
    .string()
    .refine(
      (value) => value.trim() === "" || PHONE_PATTERN.test(value.trim()),
      "Enter a valid phone number.",
    ),
})

type ProfileValues = z.infer<typeof profileSchema>

type ProfileUser = {
  name?: string | null
  email?: string | null
  image?: string | null
  phone?: string | null
}

function fieldClass(hasError?: boolean) {
  return cn(hasError && "border-error focus:border-error focus:ring-error/30")
}

export function ProfileForm() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const user = session?.user as ProfileUser | undefined

  const [imageMode, setImageMode] = useState<"url" | "upload">("url")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", image: "", phone: "" },
  })

  useEffect(() => {
    if (!user) return
    reset({
      name: user.name ?? "",
      image: user.image ?? "",
      phone: user.phone ?? "",
    })
  }, [user, reset])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const imageValue = useWatch({ control, name: "image" }) ?? ""
  const previewSrc =
    imageMode === "upload"
      ? objectUrl
      : HTTPS_URL.test(imageValue.trim())
        ? imageValue.trim()
        : null

  function switchMode(mode: "url" | "upload") {
    setImageMode(mode)
    if (mode === "url") {
      setImageFile(null)
      setObjectUrl(null)
    }
  }

  async function onSubmit(values: ProfileValues) {
    if (uploading) return
    setFormError(null)

    let image = values.image.trim()
    if (imageMode === "upload" && imageFile) {
      setUploading(true)
      const uploaded = await uploadImage(imageFile, false)
      setUploading(false)
      if (!uploaded) return
      image = uploaded
    }

    try {
      await profileApi.update({
        name: values.name.trim(),
        image: image || undefined,
        // Send "" so the whitelisted PATCH can clear a previously saved phone.
        phone: values.phone.trim(),
      })
      toast.success("Your profile has been updated.")
      await authClient.getSession()
      router.refresh()
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Could not update your profile. Please try again."
      setFormError(message)
      toast.error(message)
    }
  }

  if (isPending) {
    return (
      <div className="card-salon space-y-4 p-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    )
  }

  return (
    <div className="card-salon p-6">
      <h1 className="font-heading text-2xl">My Profile</h1>
      <p className="mt-1 text-sm text-base-content/60">
        Keep your personal details up to date.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">
            Full Name
          </label>
          <Input
            id="profile-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={fieldClass(Boolean(errors.name))}
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
          <p className="mt-1 text-xs text-base-content/50">
            Your email address cannot be changed here.
          </p>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Profile Image</span>
          <div className="mb-2 flex gap-2" role="group" aria-label="Image source">
            <Button
              type="button"
              size="sm"
              variant={imageMode === "url" ? "primary" : "outline"}
              onClick={() => switchMode("url")}
            >
              Image URL
            </Button>
            <Button
              type="button"
              size="sm"
              variant={imageMode === "upload" ? "primary" : "outline"}
              onClick={() => switchMode("upload")}
            >
              Upload
            </Button>
          </div>

          {imageMode === "url" ? (
            <div>
              <label htmlFor="profile-image" className="mb-1 block text-sm font-medium">
                Image URL
              </label>
              <Input
                id="profile-image"
                type="url"
                placeholder="https://..."
                aria-invalid={Boolean(errors.image)}
                className={fieldClass(Boolean(errors.image))}
                {...register("image")}
              />
              {errors.image && (
                <p className="mt-1 text-sm text-error">{errors.image.message}</p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="profile-file" className="mb-1 block text-sm font-medium">
                Choose an image
              </label>
              <input
                id="profile-file"
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                className="min-h-11 w-full rounded-xl border border-base-300 bg-base-100 p-2 text-sm"
              />
              <p className="mt-1 text-xs text-base-content/50">JPG, PNG or WebP up to 5 MB.</p>
            </div>
          )}

          {previewSrc && (
            <div className="relative mt-3 size-20 overflow-hidden rounded-xl border border-base-300">
              <Image
                src={previewSrc}
                alt="Selected profile preview"
                fill
                unoptimized
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="profile-phone" className="mb-1 block text-sm font-medium">
            Phone <span className="font-normal text-base-content/50">(optional)</span>
          </label>
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            aria-invalid={Boolean(errors.phone)}
            className={fieldClass(Boolean(errors.phone))}
            {...register("phone")}
          />
          {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone.message}</p>}
        </div>

        {formError && <p className="text-sm text-error">{formError}</p>}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={uploading || isSubmitting}
          loading={uploading || isSubmitting}
        >
          {uploading ? "Uploading image..." : isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
