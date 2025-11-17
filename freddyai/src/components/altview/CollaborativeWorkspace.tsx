import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Users, Calendar, AlertCircle } from 'lucide-react'

const CollaborativeWorkspace: React.FC = () => {
  const projects = [
    {
      title: 'Q3 Amstel Campaign Brief',
      assignee: 'Maria Rodriguez',
      dueDate: '2025-01-15',
      priority: 'high',
      status: 'In Progress'
    },
    {
      title: 'Cruzcampo Festival Activation Plan',
      assignee: 'Carlos Mendez',
      dueDate: '2025-01-20',
      priority: 'medium',
      status: 'Planning'
    },
    {
      title: 'Summer 2025 Media Strategy',
      assignee: 'Ana Garcia',
      dueDate: '2025-01-10',
      priority: 'high',
      status: 'Review'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Collaborative Workspace
        </CardTitle>
        <p className="text-sm text-gray-600">Active Projects & To-Dos</p>
        <p className="text-xs text-gray-500">Team collaboration and project tracking</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{project.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Assigned to {project.assignee}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Due {project.dueDate}</span>
              </div>
            </div>
            
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                <AlertCircle className="w-3 h-3" />
                {project.status}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default CollaborativeWorkspace