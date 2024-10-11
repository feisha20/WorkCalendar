"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from '../components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Checkbox } from '../components/ui/checkbox'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type WorkItem = {
  id: string
  date: string
  content: string
  completed: boolean
}

export default function Home() {
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

  const generateWeeklyReport = (): string => {
    if (!selectedDate) return ''

    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    let report = `周报 (${format(weekStart, 'MMM d', { locale: zhCN })} - ${format(weekEnd, 'MMM d, yyyy', { locale: zhCN })})\n\n`

    daysInWeek.forEach(day => {
      const dayItems = workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      if (dayItems.length > 0) {
        report += `${format(day, 'EEEE, MMM d', { locale: zhCN })}:\n`
        dayItems.forEach(item => {
          report += `- [${item.completed ? '✓' : ' '}] ${item.content}\n`
        })
        report += '\n'
      }
    })

    return report
  }

  const generateMonthlyReport = (): string => {
    if (!selectedDate) return ''

    const monthStart = startOfMonth(selectedDate)
    const monthEnd = endOfMonth(selectedDate)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    let report = `月报 (${format(monthStart, 'yyyy年MM月', { locale: zhCN })})\n\n`

    daysInMonth.forEach(day => {
      const dayItems = workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      if (dayItems.length > 0) {
        report += `${format(day, 'MM月dd日', { locale: zhCN })}:\n`
        dayItems.forEach(item => {
          report += `- [${item.completed ? '✓' : ' '}] ${item.content}\n`
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
    <div className="flex h-screen w-screen bg-gray-100">
      <div className="w-1/3 border-r border-gray-200 bg-white p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">工作日历</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => setSelectedDate(date || new Date())}
          className="rounded-md border mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">
          {selectedDate ? format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN }) : '请选择日期'}
        </h3>
        <div className="space-y-2 mb-4">
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
        <div className="flex gap-2">
          <Input
            placeholder="输入工作项目"
            value={newWorkContent}
            onChange={(e) => setNewWorkContent(e.target.value)}
          />
          <Button onClick={addWorkItem}>Add</Button>
        </div>
      </div>

      <div className="w-1/3 border-r border-gray-200 bg-white p-4">
        <h2 className="text-2xl font-bold mb-4">周报</h2>
        <Textarea
          value={generateWeeklyReport()}
          readOnly
          className="w-full h-[calc(100%-3rem)] resize-none"
        />
      </div>

      <div className="w-1/3 bg-white p-4">
        <h2 className="text-2xl font-bold mb-4">月报</h2>
        <Textarea
          value={generateMonthlyReport()}
          readOnly
          className="w-full h-[calc(100%-3rem)] resize-none"
        />
      </div>
    </div>
  )
}