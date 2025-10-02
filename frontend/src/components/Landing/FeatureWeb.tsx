import { employerFeatures, jobSeekerFeatures } from "@/utils/data";

const FeatureWeb = () => {
  return (
    <section className="relative bg-white overflow-hidden py-20">
      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            Everything You Need to
            <span className="block bg-gradient-to-r from-[#29436c] to-[#90ad71] bg-clip-text text-transparent">Succeed</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            Whether you're looking for your next opportunity or the perfect
            candidate, we have the tools and features to make it happen.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl items-start gap-16 md:grid-cols-2 lg:gap-24">
          <div className="">
            <div className="mb-12 text-center">
              <h3 className="mb-4 text-3xl font-bold text-gray-900">For Job Seekers</h3>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#29436c]" />
            </div>

            <div className="space-y-8">
              {jobSeekerFeatures.map((feature, index) => (
                <div className="group flex w-full cursor-pointer items-center space-x-4 rounded-2xl p-6 transition-all duration-300 hover:bg-blue-50" key={index}>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 transition-colors group-hover:bg-blue-200">
                    <feature.icon className="h-6 w-6 text-[#29436c]"/>
                  </div>
                  <div className="">
                    <h4 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h4>
                    <p className="leading-relaxed text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="">
            <div className="mb-12 text-center">
              <h3 className="mb-4 text-3xl font-bold text-gray-900">For Employers</h3>
              <div className="mx-auto h-1 w-24 rounded-full bg-[#90ad71]" />
            </div>

            <div className="space-y-8">
              {employerFeatures.map((feature, index) => (
                <div className="group flex w-full cursor-pointer items-center space-x-4 rounded-2xl p-6 transition-all duration-300 hover:bg-green-50" key={index}>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-100 transition-colors group-hover:bg-green-200">
                    <feature.icon className="h-6 w-6 text-[#90ad71]" />
                  </div>
                  <div className="">
                    <h4 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h4>
                    <p className="leading-relaxed text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureWeb;
