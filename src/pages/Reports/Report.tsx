import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

export const Report = () => {
    const empId = useSelector((state: IRootState) => state.auth.id);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmpId, setSelectedEmpId] = useState<string>(empId || '');
    const [leadStatusChart, setLeadStatusChart] = useState<any | null>(null);
    const [operationStatusChart, setOperationStatusChart] = useState<any | null>(null);
    const [reportData, setReportData] = useState<any | null>(null);

    // Fetch all employees for the dropdown
    useEffect(() => {
        const getAllEmp = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllEmp/${companyId}`);
                setEmployees(response.data);
            } catch (err) {
                console.log('Error fetching employees:', err);
            }
        };
        getAllEmp();
    }, [companyId]);

    // Fetch report data when selectedEmpId changes
    useEffect(() => {
        const getReportData = async () => {
            try {
                const baseURL = import.meta.env.VITE_BASE_URL;
                const endpoints = [
                    axios.get(`${baseURL}api/countLeads/${selectedEmpId}`),
                    axios.get(`${baseURL}api/assignedLeadsCount/${selectedEmpId}`),
                    axios.get(`${baseURL}api/assignedOperationsCount/${selectedEmpId}`),
                    axios.get(`${baseURL}api/leadStatusCount/${selectedEmpId}`),
                    axios.get(`${baseURL}api/OperationStatusCount/${selectedEmpId}`),
                ];

                const [leadsMadeRes, assignedLeadsRes, assignedOperationsRes, leadStatusRes, operationStatusRes] = await Promise.all(endpoints);
                const leadChart = formatToDonutChart(leadStatusRes.data.count);
                const operationChart = formatToDonutChart(operationStatusRes.data.count);
                setLeadStatusChart(leadChart);
                setOperationStatusChart(operationChart);
                console.log('Lead Status Chart:', leadChart);
                console.log('Operation Status Chart:', operationChart);

                setReportData({
                    leadsMade: leadsMadeRes.data,
                    assignedLeads: assignedLeadsRes.data,
                    assignedOperations: assignedOperationsRes.data,
                    leadStatus: leadStatusRes.data,
                    operationStatus: operationStatusRes.data,
                });
            } catch (err) {
                console.error('Error fetching report data:', err);
            }
        };

        if (selectedEmpId) {
            getReportData();
        }
    }, [selectedEmpId]);

    const formatToDonutChart = (dataArray: any[]) => {
        const labels = dataArray.map((item) => item._id);
        const price = dataArray.map((item) => item.totalAmount || 0);
        const series = dataArray.map((item) => item.count);

        return {
            series,
            price,
            options: {
                // chart: {
                //     type: 'donut',
                // },
                labels,
                legend: {
                    position: 'bottom',
                },
                dataLabels: {
                    enabled: true,
                },
            },
        };
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Employee Report</h2>

            {/* Employee Dropdown */}
            <select name="employee" value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="mb-4 p-2 border rounded">
                {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                        {emp.name || emp.email}
                    </option>
                ))}
            </select>

            {/* Report Table (Example layout) */}
            <table className="w-full border mt-4">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Metric</th>
                        <th className="border px-4 py-2">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData ? (
                        <>
                            <tr>
                                <td className="border px-4 py-2">Leads Made</td>
                                <td className="border px-4 py-2">{reportData.leadsMade.count || 0}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Assigned Leads</td>
                                <td className="border px-4 py-2">{reportData.assignedLeads.count || 0}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2">Assigned Operations</td>
                                <td className="border px-4 py-2">{reportData.assignedOperations.count || 0}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 align-top">Lead Status</td>
                                <td className="border px-4 py-2">
                                    {reportData.leadStatus?.count?.length > 0 ? (
                                        <ul className="list-disc pl-4">
                                            {reportData.leadStatus.count.map((item: any, index: number) => (
                                                <li key={index}>
                                                    {item._id}: {item.count}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No Data'
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <td className="border px-4 py-2 align-top">Operation Status</td>
                                <td className="border px-4 py-2">
                                    {reportData.operationStatus?.count?.length > 0 ? (
                                        <ul className="list-disc pl-4">
                                            {reportData.operationStatus.count.map((item: any, index: number) => (
                                                <li key={index}>
                                                    {item._id}: {item.count}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No Data'
                                    )}
                                </td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td colSpan={2} className="text-center py-4">
                                Loading report...
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div>
                <div className="flex flex-row gap-4 mt-6">
                    {leadStatusChart && (
                        <div className="bg-white dark:bg-black rounded-lg overflow-hidden mt-6">
                            <h3 className="text-lg font-semibold text-center mb-2">Lead Status Chart</h3>
                            <ReactApexChart series={leadStatusChart.series} options={leadStatusChart.options} type="donut" height={300} />
                            <br />
                        </div>
                    )}
                    {leadStatusChart && (
                        <div className="bg-white dark:bg-black rounded-lg overflow-hidden mt-6">
                            <h3 className="text-lg font-semibold text-center mb-2">Lead Price Chart</h3>
                            <ReactApexChart
                                series={leadStatusChart.price} // <-- using total price
                                options={leadStatusChart.options}
                                type="pie"
                                height={300}
                            />
                        </div>
                    )}

                    {operationStatusChart && (
                        <div className="bg-white dark:bg-black rounded-lg overflow-hidden mt-6">
                            <h3 className="text-lg font-semibold text-center mb-2">Operation Status Chart</h3>
                            <ReactApexChart series={operationStatusChart.series} options={operationStatusChart.options} type="donut" height={300} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
