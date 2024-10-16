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
import io from 'socket.io-client'
import { FiTrash2, FiSun, FiMoon } from 'react-icons/fi'  // 导入删除图标
import { useTheme } from 'next-themes'  // 导入 useTheme hook

type WorkItem = {
  id: string
  date: string
  content: string
  completed: boolean
}

// 新增: 用于渲染带有超链接的内容的组件
const ContentWithLinks: React.FC<{ content: string }> = ({ content }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 dark:text-blue-400 hover:underline"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

// 新增: 用于渲染带有超链接的报告的组件
const ReportWithLinks: React.FC<{ report: string }> = ({ report }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = report.split('\n');

  return (
    <>
      {lines.map((line, index) => {
        const parts = line.split(urlRegex);
        return (
          <p key={index}>
            {parts.map((part, partIndex) => {
              if (part.match(urlRegex)) {
                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </>
  );
};

// 更新 AnalogClock 组件
const AnalogClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const secondsDegrees = (time.getSeconds() / 60) * 360;
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360;
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360;

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-700 border-4 border-gray-200 dark:border-gray-600 shadow-lg relative mb-4">
        {/* 时针 */}
        <div
          className="absolute w-1.5 h-10 bg-black dark:bg-white rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${hoursDegrees}deg)`,
            transformOrigin: 'bottom',
          }}
        />
        {/* 分针 */}
        <div
          className="absolute w-1 h-14 bg-black dark:bg-white rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${minutesDegrees}deg)`,
            transformOrigin: 'bottom',
          }}
        />
        {/* 秒针 */}
        <div
          className="absolute w-0.5 h-14 bg-red-500 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -100%) rotate(${secondsDegrees}deg)`,
            transformOrigin: 'bottom',
          }}
        />
        {/* 中心点 */}
        <div className="absolute w-3 h-3 bg-black dark:bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* 更新的数字时钟 */}
      <div className="flex flex-col items-center">
        <div className="text-5xl font-bold mb-2 dark:text-white">
          {time.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-lg dark:text-gray-300">
          {time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [newWorkContent, setNewWorkContent] = useState('')
  // 新增：用于存储有工作内容的日期
  const [datesWithTasks, setDatesWithTasks] = useState<Date[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchWorkItems()
    
    // 连接 WebSocket
    const socket = io({
      path: '/api/socketio',
    })
    
    // 初始化 WebSocket
    fetch('/api/socketio').finally(() => {
      // 监听工作项目更新
      socket.on('workItemsUpdated', (updatedWorkItems: WorkItem[]) => {
        setWorkItems(updatedWorkItems)
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchWorkItems = async () => {
    const response = await fetch('/api/workItems')
    const data = await response.json()
    setWorkItems(data)

    // 更新有工作内容的日期
    const dates = data.map((item: WorkItem) => parseISO(item.date))
    setDatesWithTasks(dates)
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
      setNewWorkContent('')
      // 不需要手动更新 workItems，因为服务器会通过 WebSocket 发送更新
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
      // 不需要手动更新 workItems，因为服务器会通过 WebSocket 发送更新
    }
  }

  const deleteWorkItem = async (id: string) => {
    const response = await fetch(`/api/workItems?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      // 不需要手动更新 workItems，因为服务器会通过 WebSocket 发送更新
      console.log('任务已成功删除');
    } else {
      console.error('删除任务失败');
    }
  }

  const generateWeeklyReport = (): string => {
    if (!selectedDate) return ''

    const weekStart = startOfWeek(selectedDate)
    const weekEnd = endOfWeek(selectedDate)
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })

    let report = `周报 (${format(weekStart, 'MM月dd日', { locale: zhCN })} - ${format(weekEnd, 'MM月dd日, yyyy', { locale: zhCN })})\n\n`

    daysInWeek.forEach(day => {
      const dayItems = workItems.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
      if (dayItems.length > 0) {
        report += `${format(day, 'EEEE, MM月dd日', { locale: zhCN })}:\n`
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // 如果组件还没有挂载，返回null以避免服务器端渲染差异
  if (!mounted) return null

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">工作日历</h2>
          <Button onClick={toggleTheme} variant="ghost" size="icon">
            {theme === 'light' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-1/2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md border"
              modifiers={{ hasTask: datesWithTasks }}
              modifiersStyles={{
                hasTask: {
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }
              }}
              components={{
                DayContent: ({ date }) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {date.getDate()}
                    {datesWithTasks.some(taskDate => 
                      taskDate.getDate() === date.getDate() &&
                      taskDate.getMonth() === date.getMonth() &&
                      taskDate.getFullYear() === date.getFullYear()
                    ) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                )
              }}
            />
          </div>
          <div className="w-1/2 flex justify-center items-start pt-8">
            <AnalogClock />
          </div>
        </div>
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
                className="border-gray-400 dark:border-white"
              />
              <label
                htmlFor={item.id}
                className={`flex-grow ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
              >
                <ContentWithLinks content={item.content} />
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteWorkItem(item.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <FiTrash2 className="text-red-500 dark:text-red-400" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="输入工作项目"
            value={newWorkContent}
            onChange={(e) => setNewWorkContent(e.target.value)}
            className="dark:bg-gray-700 dark:text-white"
          />
          <Button onClick={addWorkItem}>Add</Button>
        </div>
      </div>

      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">周报</h2>
        <div className="w-full h-[calc(100%-3rem)] overflow-auto dark:text-gray-300">
          <ReportWithLinks report={generateWeeklyReport()} />
        </div>
      </div>

      <div className="w-1/3 bg-white dark:bg-gray-800 p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">月报</h2>
        <div className="w-full h-[calc(100%-3rem)] overflow-auto dark:text-gray-300">
          <ReportWithLinks report={generateMonthlyReport()} />
        </div>
      </div>
    </div>
  )
}