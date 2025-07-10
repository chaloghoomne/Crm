import { useEffect, useState, Fragment } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Tab } from '@headlessui/react';
import { IRootState } from '../../store';
import { emp } from '../../types/types';
import { GiToaster } from 'react-icons/gi';
import Swal from 'sweetalert2';

interface Task {
  _id?: string;
  taskName: string;
  description: string;
assignedTo: string;
  dueDate: string;
  priority?: string;
  status?: string;
assignedToName?: string;
client?: string;
}
interface Client {
  _id: string
  name: string
  email: string
  address: string
  phone: string
  gstNumber?: string
}

export const TaskAssign = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData,setFormData] = useState<Task>({
    taskName: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: '',
    client:'',
  })
  const [allEmp, setAllEmp] = useState<emp[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [send, setSend] = useState(false);
  const companyId = useSelector((state: IRootState) => state.auth.company_id);

  const showAlert = async (type: number) => {
    if (type === 1) {
        Swal.fire({
            title: 'Saved succesfully',
            padding: '2em',
            customClass: {
                    popup: 'sweet-alerts',
                },
        });
    }
    else{
        Swal.fire({
            title: 'Something went wrong',
            padding: '2em',
            customClass: {
                    popup: 'sweet-alerts',
                },
        });
    }
}

  const handleAddTask = async () => {
    if (!formData.taskName || !formData.description || !formData.dueDate || !formData.assignedTo || !formData.priority)
      return alert('Please fill all fields');

    const employee = allEmp.find((emp) => emp._id === formData.assignedTo);
    const clientName = allClients.find((client:Client)=> client._id === formData.client)
   try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}api/createTask`, {
        ...formData,
        assignedToName: employee?.name || 'Unassigned',
        clientName: clientName?.name || 'Unassigned',
        companyId,
      });
      setSend((prev) => !prev);
      resetForm();
      showAlert(1)
    } catch (err) {
      console.log(err);
    }
  };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>{
        console.log(e.target)
        const {name, value} = e.target;
        setFormData((prev) => ({
          ...prev,[name]: value}))
    }

  const resetForm = () => {
    setFormData({
      taskName: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: '',
      client: '',
      assignedToName: '',
    });
  };

  const getAllEmp = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllEmp/${companyId}`);
      setAllEmp(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getAllClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getClients/${companyId}`)
      setAllClients(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getAllTasks = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllTasks/${companyId}`);
      console.log(res.data);
      setTasks(res.data.tasks);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllEmp();
    getAllTasks();
    getAllClients();
  }, [send]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Tab.Group>
          <Tab.List className="flex space-x-4 mb-6">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`px-4 py-2 rounded ${
                    selected ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'
                  }`}
                >
                  Assign Task
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`px-4 py-2 rounded ${
                    selected ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'
                  }`}
                >
                  All Tasks
                </button>
              )}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Assign a New Task</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="taskName"
                    placeholder="Task Title"
                    className="border p-2 rounded"
                    value={formData.taskName}
                    onChange={handleChange}
                  />
                  <input
                    type="date"
                    name="dueDate"
                    className="border p-2 rounded"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                  <textarea
                    placeholder="Task Description"
                    name="description"
                    className="border p-2 rounded col-span-1 md:col-span-2"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                  <select
                    className="border p-2 rounded"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">Select an Employee</option>
                    {allEmp.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  <select
                    className="border p-2 rounded"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                  >
                    <option value="">Select a Client</option>
                    {allClients.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.email})
                      </option>
                    ))}
                  </select>
                  <select
                    className="border p-2 rounded"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                  <button
                    onClick={handleAddTask}
                    className="col-span-1 md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                  >
                    Assign Task
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">All Assigned Tasks</h2>
                {tasks.length === 0 ? (
                  <p>No tasks assigned yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {tasks.map((task) => (
                      <li
                        key={task._id}
                        className="border p-4 rounded-md shadow-sm flex flex-col md:flex-row justify-between"
                      >
                        <div>
                          <h3 className="font-bold text-lg">{task.taskName}</h3>
                          <p className="text-sm text-gray-700">{task.description}</p>
                          <p className="text-sm mt-1">
                            Assigned to: <strong>{task.assignedToName || task.assignedToName}</strong>
                          </p>
                          <p className="text-sm mt-1">Priority: <strong>{task.priority}</strong></p>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 md:mt-0">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
