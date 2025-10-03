import React from 'react'
import {
  Bookmark,
  BriefcaseBusiness,
  MessageSquareWarning,
} from "lucide-react";
const JobSeekerDashBoardContent = () => {
  return (
    <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Dashboard</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Applied Jobs */}
          <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-100">
              <BriefcaseBusiness className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">22</p>
              <p className="text-gray-600">Applied Jobs</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-100">
              <MessageSquareWarning className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-600">9382</p>
              <p className="text-gray-600">Job Alerts</p>
            </div>
          </div>

          {/* Profile Status */}
          <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100">
              <Bookmark className="h-8 w-8 text-green-600"/>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">32</p>
              <p className="text-gray-600">Shortlist</p>
            </div>
          </div>
        </div>
      </div>
  )
}

export default JobSeekerDashBoardContent