"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from './components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Checkbox } from './components/ui/checkbox'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns'

type WorkItem = {
  id: string
  date: string
  content: string
  completed: boolean
}

export default function WorkCalendarApp() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [newWorkContent, setNewWorkContent] = useState('')

  useEffect(() => {
    fetchWorkItems()
  }, [])

  const fetchWorkItems = async () => {
    const response = await fetch('/api/workItems')
    const data = await response.json()
    setWorkItems(data)
  }

  const addWorkItem = async () => {
    if (selectedDate && newWorkContent) {
      const response = await fetch('/api/workItems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: format(selectedDate, 'yyyy-MM-dd'),
          content: newWorkContent,
        }),
      })
      const newItem = await response.json()
      setWorkItems([...workItems, newItem])
      setNewWorkContent('')
    }
  }

  const toggleWorkItemCompletion = async (id: string) => {
    const item = workItems.find(item => item.id === id)
    if (item) {
      const response = await fetch(`/api/workItems?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !item.completed,
        }),
      })
      if (response.ok) {
        setWorkItems(workItems.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        ))
      }
    }
  }

  const generateWeeklyReport = () => {
    if (!selectedDate) return ''

    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    let report = `Weekly Report (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')})\n\n`

    daysInWeek.forEach(day => {
      const dayItems = workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
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
      const dayItems = workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
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
    return workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))
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
            onSelect={(date) => setSelectedDate(date || new Date())}
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