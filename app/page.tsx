import { Banner } from "@/components/banner"
import { WhyChooseUs } from "@/components/home/why-choose-us"
import { HowItWorks } from "@/components/home/how-it-works"
import { FeaturedServices } from "@/components/home/featured-services"
import { ServiceCategories } from "@/components/home/service-categories"

export default function Page() {
  return (
    <main className="flex-1">
      <Banner />

      <FeaturedServices />

      <ServiceCategories />

      <WhyChooseUs />

      <HowItWorks />
    </main>
  )
}