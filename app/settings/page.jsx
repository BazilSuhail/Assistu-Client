export default function StudentPortal() {
  const user = {
    name: "Jane Doe",
    role: "Student Assistant",
    location: "Campus A",
    image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400"
  }

  const sections = [
    {
      title: "Notifications",
      settings: [
        { label: "Email Alerts", enabled: true },
        { label: "Task Reminders", enabled: false },
        { label: "Portal Updates", enabled: true }
      ]
    },
    {
      title: "Privacy",
      settings: [
        { label: "Two Factor Login", enabled: false },
        { label: "Data Sharing", enabled: true }
      ]
    },
    {
      title: "Preferences",
      settings: [
        { label: "Dark Mode", enabled: false },
        { label: "Sound", enabled: true }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-2xl mx-auto space-y-10">
      <div className="flex flex-col items-center">
        <img
          src={user.image}
          alt="profile"
          className="w-32 h-32 rounded-full object-cover border border-black"
        />
        <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
        <p className="text-sm mt-1">{user.role}</p>
        <p className="text-sm text-neutral-600">{user.location}</p>
      </div>

      <div className="border-t border-neutral-300 pt-10 space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="border border-black p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold">{section.title}</h2>
            {section.settings.map((setting, sidx) => (
              <div
                key={sidx}
                className="flex justify-between items-center p-3 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <label className="cursor-pointer">{setting.label}</label>
                <div className="relative inline-block w-12 h-6 bg-neutral-300 rounded-full">
                  <input
                    type="checkbox"
                    defaultChecked={setting.enabled}
                    className="absolute opacity-0 w-full h-full cursor-pointer"
                  />
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full border border-black transition-all ${
                      setting.enabled ? "translate-x-6 bg-black" : "bg-white"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border border-black p-6 rounded-xl space-y-3">
        <h2 className="text-lg font-bold">About Portal</h2>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Version</span>
          <span className="font-medium">1.0.0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Updated</span>
          <span className="font-medium">Today</span>
        </div>
      </div>
    </div>
  )
}