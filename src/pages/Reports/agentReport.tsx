import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

export const AgentReport = () => {
    const currentAgentId = useSelector((state: IRootState) => state.auth.id);
    const companyId = useSelector((state: IRootState) => state.auth.company_id);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>(currentAgentId || '');
    const [leadStatusChartData, setLeadStatusChartData] = useState<any | null>(null);
    const [agentReportData, setAgentReportData] = useState<any | null>(null);

    // Fetch all agents for the dropdown
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAgents/${companyId}`);
                console.log('Fetched agents:', response.data.agent);
                setAgents(response.data.agent);
            } catch (err) {
                console.error('Error fetching agents:', err);
            }
        };  
        fetchAgents();
    }, [companyId]);

    // Fetch report data for selected agent
    useEffect(() => {
        if (!selectedAgentId) return;

        const fetchReport = async () => {
            try {
                const baseURL = import.meta.env.VITE_BASE_URL;
                const [leadsCountRes, leadStatusRes] = await Promise.all([
                    axios.get(`${baseURL}api/agentLeadsCount/${selectedAgentId}`),
                    axios.get(`${baseURL}api/agentReportStatus/${selectedAgentId}`)
                ]);

                const chartData = formatToDonutChart(leadStatusRes.data.status);
                setLeadStatusChartData(chartData);

                setAgentReportData({
                    leadsCount: leadsCountRes.data,
                    leadStatus: leadStatusRes.data,
                });
            } catch (err) {
                console.error('Error fetching report data:', err);
            }
        };

        fetchReport();
    }, [selectedAgentId]);

    const formatToDonutChart = (dataArray: any[]) => {
        const labels = dataArray.map(item => item._id);
        const series = dataArray.map(item => item.count);
        const totalAmounts = dataArray.map(item => item.totalAmount || 0);

        return {
            series,
            price: totalAmounts,
            options: {
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Agent Performance Report</h2>

            {/* Agent Dropdown */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Select Agent:</label>
                <select
                    name="agent"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full md:w-1/3 p-2 border rounded shadow-sm"
                >
                    {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                            {agent.name || agent.email}
                        </option>
                    ))}
                </select>
            </div>

            {/* Summary Report Table */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 rounded-lg shadow-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="border px-4 py-2 text-left">Metric</th>
                            <th className="border px-4 py-2 text-left">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agentReportData ? (
                            <>
                                <tr>
                                    <td className="border px-4 py-2">Total Leads</td>
                                    <td className="border px-4 py-2">{agentReportData.leadsCount.count || 0}</td>
                                </tr>
                                <tr>
                                    <td className="border px-4 py-2 align-top">Leads by Status</td>
                                    <td className="border px-4 py-2">
                                        {agentReportData.leadStatus?.status?.length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {agentReportData.leadStatus.status.map((item: any, index: number) => (
                                                    <li key={index}>
                                                        {item._id}: {item.count}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            'No data available'
                                        )}
                                    </td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan={2} className="text-center py-4 text-gray-500">
                                    Loading report...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Charts Section */}
            <div className="flex flex-row gap-2 mt-10">
                {leadStatusChartData && (
                    <div className="bg-white dark:bg-black rounded-lg p-4 shadow-md w-full md:w-1/2">
                        <h3 className="text-lg font-semibold text-center mb-4">Lead Status Distribution</h3>
                        <ReactApexChart
                            series={leadStatusChartData.series}
                            options={leadStatusChartData.options}
                            type="donut"
                            height={300}
                        />
                    </div>
                )}
                {leadStatusChartData && (
                    <div className="bg-white dark:bg-black rounded-lg p-4 shadow-md w-full md:w-1/2">
                        <h3 className="text-lg font-semibold text-center mb-4">Lead Value Distribution</h3>
                        <ReactApexChart
                            series={leadStatusChartData.price}
                            options={leadStatusChartData.options}
                            type="pie"
                            height={300}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
