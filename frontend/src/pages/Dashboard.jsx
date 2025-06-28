import React, { useCallback, useMemo, useState } from 'react';
import {
  ADD_BUTTON,
  EMPTY_STATE,
  FILTER_LABELS,
  FILTER_OPTIONS,
  FILTER_WRAPPER,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  SELECT_CLASSES,
  STAT_CARD,
  STATS,
  STATS_GRID,
  TAB_ACTIVE,
  TAB_BASE,
  TAB_INACTIVE,
  TABS_WRAPPER,
  VALUE_CLASS,
  WRAPPER,
} from '../assets/dummy';
import { CalendarIcon, Filter, HomeIcon, Plus } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/tasks';

const Dashboard = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === 'low').length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === 'medium').length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === 'high').length,
    completed: tasks.filter(t =>
      t.completed === true ||
      t.completed === 1 ||
      (typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes')
    ).length,
  }), [tasks]);

  const filteredTasks = useMemo(() =>
    tasks.filter(task => {
      const dueDate = new Date(task.dueDate); // Standardized casing
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      switch (filter) {
        case 'today':
          return dueDate.toDateString() === today.toDateString();
        case 'week':
          return dueDate >= today && dueDate <= nextWeek;
        case 'high':
        case 'medium':
        case 'low':
          return task.priority?.toLowerCase() === filter;
        default:
          return true;
      }
    }), [tasks, filter]);

  const handleTaskSave = useCallback(async (taskData) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

      // Validation
      if (!taskData.title || !taskData.priority || !taskData.dueDate) {
        alert("Please fill in all required fields: Title, Priority, and Due Date.");
        return;
      }

      const url = taskData.id || taskData._id
        ? `${API_BASE}/${taskData.id || taskData._id}/gp`
        : `${API_BASE}/gp`;

      const method = taskData.id || taskData._id ? 'put' : 'post';

      await axios[method](url, taskData, { headers });

      await refreshTasks();
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error saving task:", error?.response?.data || error);
      alert(error?.response?.data?.message || "Error saving task");
    }
  }, [refreshTasks]);

  return (
    <div className={WRAPPER}>
      <div className={HEADER}>
        <div className='min-w-0'>
          <h1 className='text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2'>
            <HomeIcon className='text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0' />
            <span className='truncate'>Task Overview</span>
          </h1>
          <p className='text-sm text-gray-500 mt-1 ml-7 truncate'>
            Manage your tasks efficiently!!
          </p>
        </div>
      </div>

      <div className={STATS_GRID}>
        {STATS.map(({ key, label, icon: Icon, iconColor, borderColor, valueKey, textColor, gradient }) => (
          <div key={key} className={`${STAT_CARD} ${iconColor}`}>
            <div className='flex items-center gap-2 md:gap-3'>
              <div className={`${ICON_WRAPPER} ${iconColor}`}>
                <Icon className='w-5 h-5 md:w-6 md:h-6' />
              </div>
              <div className='min-w-0'>
                <p className={`${VALUE_CLASS} ${gradient ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent" : textColor}`}>
                  {stats[valueKey]}
                </p>
                <p className={LABEL_CLASS}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='space-y-6'>
        <div className={FILTER_WRAPPER}>
          <div className='flex items-center gap-2 min-w-0'>
            <Filter className='w-5 h-5 text-purple-500 shrink-0' />
            <h2 className='text-base md:text-lg font-semibold text-gray-800 truncate'>
              {FILTER_LABELS[filter]}
            </h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={SELECT_CLASSES}
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          <div className={TABS_WRAPPER}>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE}`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          {filteredTasks.length === 0 ? (
            <div className={EMPTY_STATE.wrapper}>
              <div className={EMPTY_STATE.iconWrapper}>
                <CalendarIcon className='w-8 h-8 text-purple-500' />
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                No tasks found !!
              </h3>
              <p className='text-sm text-gray-500 mb-4'>
                {filter === "all" ? "Create your first task to get started!!" : "No tasks match this filter"}
              </p>
              <button onClick={() => setShowModal(true)} className={EMPTY_STATE.btn}>
                Add new Task
              </button>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              />
            ))
          )}
        </div>

        <div
          onClick={() => setShowModal(true)}
          className='hidden md:flex items-center p-4 justify-center border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors'
        >
          <Plus className='w-5 h-5 text-purple-500 mr-2' />
          <span className='text-gray-600 font-medium'> Add New Task</span>
        </div>
      </div>

      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={async () => {
          await refreshTasks(); // ✅ Force refresh after modal save
          setShowModal(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
