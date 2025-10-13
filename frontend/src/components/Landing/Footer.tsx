const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gray-50 text-gray-900">
      <div className="relative z-10 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <div className="mb-6 flex items-center justify-center space-x-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg">
                  <img
                    className="h-16 w-16 text-white"
                    src="/Logo_SkillSync_BR.png"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-[#29436c]">
                    Skill
                  </span>
                  <span className="text-2xl font-bold text-[#90ad71]">
                    Sync
                  </span>
                </div>
              </div>
              <p className={`mx-auto max-w-md text-sm text-gray-600`}>
                Connecting talented professionals with innovative companies
                worldwide. Your carrer success is our mission
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
