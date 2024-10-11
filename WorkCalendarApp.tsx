"use client"

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'

type WorkItem = {
  id: string
  date: Date
  content: string
  completed: boolean
}

export default function WorkCalendarApp() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [newWorkContent, setNewWorkContent] = useState('')

  const addWorkItem = () => {
    if (selectedDate && newWorkContent) {
      setWorkItems([...workItems, { 
        id: Date.now().toString(), 
        date: selectedDate, 
        content: newWorkContent, 
        completed: false 
      }])
      setNewWorkContent('')
    }
  }

  const toggleWorkItemCompletion = (id: string) => {
    setWorkItems(workItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const generateWeeklyReport = () => {
    if (!selectedDate) return ''

    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    let report = `Weekly Report (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')})\n\n`

    daysInWeek.forEach(day => {
      const dayItems = workItems.filter(item => format(item.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      if (dayItems.length > 0) {
        report += `${format(day, 'EEEE, MMM d')}:\n`
        dayItems.forEach(item => {
          report += `- [${item.completed ? 'x' : ' '}] ${item.content}\n`
        })
        report += '\n'
      }
    })

    return report
  }

  const generateMonthlyReport = () => {
    if (!selectedDate) return ''

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    let report = `Monthly Report (${format(monthStart, 'MMMM yyyy')})\n\n`

    daysInMonth.forEach(day => {
      const dayItems = workItems.filter(item => format(item.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      if (dayItems.length > 0) {
        report += `${format(day, 'MMMM d')}:\n`
        dayItems.forEach(item => {
          report += `- [${item.completed ? 'x' : ' '}] ${item.content}\n`
        })
        report += '\n'
      }
    })

    return report
  }

  const getDayWorkItems = () => {
    if (!selectedDate) return []
    return workItems.filter(item => format(item.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
  }

  return (
    <div className="flex h-screen bg-gray-100 p-8 gap-8">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Work Calendar</CardTitle>
          <CardDescription>Manage your work items</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border mb-4"
          />
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>
            <div className="space-y-2">
              {getDayWorkItems().map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => toggleWorkItemCompletion(item.id)}
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-grow ${item.completed ? 'line-through text-gray-500' : ''}`}
                  >
                    {item.content}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter work item"
              value={newWorkContent}
              onChange={(e) => setNewWorkContent(e.target.value)}
            />
            <Button onClick={addWorkItem}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Weekly Report</CardTitle>
          <CardDescription>Automatically generated based on your work items</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generateWeeklyReport()}
            readOnly
            className="h-[calc(100vh-200px)]"
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Monthly Report</CardTitle>
          <CardDescription>Overview of the entire month</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generateMonthlyReport()}
            readOnly
            className="h-[calc(100vh-200px)]"
          />
        </CardContent>
      </Card>
    </div>
  )
}