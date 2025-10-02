const Footer = () => {
  return (
    <footer className='relative bg-gray-50 text-gray-900 overflow-hidden'>
      <div className='relative z-10 px-6 py-16'>
        <div className='max-w-6xl mx-auto '>
          <div className='text-center space-y-8'>
            <div className='space-y-4'>
              <div className='flex items-center justify-center space-x-2 mb-6'>
                <div className='w-16 h-16 rounded-lg flex items-center justify-center'>
                  <img className='w-16 h-16 text-white' src='/Logo_SkillSync_BR.png'/>
                </div>
                <div className='flex items-center'>
                  <span className='text-2xl font-bold text-[#29436c]'>Skill</span>
                  <span className='text-2xl font-bold text-[#90ad71]'>Sync</span>
                </div>
              </div>
              <p className={`text-sm text-gray-600 max-w-md mx-auto`}>
                Connecting talented professionals with innovative companies
                worldwide. Your carrer success is our mission
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer