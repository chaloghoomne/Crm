import axios from 'axios';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { company } from '../../types/types';

export const CompanyReports = () => {
    const currentCompanyId = useSelector((state: IRootState) => state.auth.company_id);
    const [companies, setCompanies] = useState<company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(currentCompanyId || '');
    const [leadStatusChartData, setLeadStatusChartData] = useState<any | null>(null);
    const [companyReportData, setCompanyReportData] = useState<any | null>(null);

    // Fetch all companies for dropdown
    useEffect(() => {
        const fetchAllCompanies = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}api/getAllCompanies`);
                console.log('Fetched companies:', response.data);
                setCompanies(response.data);
            } catch (err) {
                console.error('Error fetching companies:', err);
            }
        };
        fetchAllCompanies();
    }, []);

    // Fetch report data on company selection
    useEffect(() => {
        if (!selectedCompanyId) return;

        const fetchCompanyReport = async () => {
            try {
                const baseURL = import.meta.env.VITE_BASE_URL;
                const [leadsMadeRes, leadStatusRes] = await Promise.all([
                    axios.get(`${baseURL}api/companyLeadsCount/${selectedCompanyId}`),
                    axios.get(`${baseURL}api/companyReportStatus/${selectedCompanyId}`)
                ]);

                console.log('Leads Count:', leadsMadeRes.data);
                console.log('Lead Status:', leadStatusRes.data.status);

                const leadStatusChart = formatToDonutChart(leadStatusRes.data.status);
                setLeadStatusChartData(leadStatusChart);

                setCompanyReportData({
                    leadsCount: leadsMadeRes.data,
                    leadStatus: leadStatusRes.data,
                });
            } catch (err) {
                console.error('Error fetching company report:', err);
            }
        };

        fetchCompanyReport();
    }, [selectedCompanyId]);

    // Format response to chart data
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
            <h2 className="text-xl font-bold mb-4">Company Report</h2>

            {/* Company Dropdown */}
            <select
                name="company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="mb-4 p-2 border rounded"
            >
                {companies.map((comp) => (
                    <option key={comp._id} value={comp._id}>
                        {comp.companyName}
                    </option>
                ))}
            </select>

            {/* Report Summary Table */}
            <table className="w-full border mt-4">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-4 py-2">Metric</th>
                        <th className="border px-4 py-2">Value</th>
                    </tr>
                </thead>
                <tbody>
                    {companyReportData ? (
                        <>
                            <tr>
                                <td className="border px-4 py-2">Total Leads</td>
                                <td className="border px-4 py-2">{companyReportData.leadsCount.count || 0}</td>
                            </tr>
                            <tr>
                                <td className="border px-4 py-2 align-top">Leads by Status</td>
                                <td className="border px-4 py-2">
                                    {companyReportData.leadStatus?.status?.length > 0 ? (
                                        <ul className="list-disc pl-4">
                                            {companyReportData.leadStatus.status.map((item: any, idx: number) => (
                                                <li key={idx}>
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

            {/* Charts */}
            <div className="flex flex-row gap-4 mt-6">
                {leadStatusChartData && (
                    <div className="bg-white dark:bg-black rounded-lg overflow-hidden p-4 w-full md:w-1/2">
                        <h3 className="text-lg font-semibold text-center mb-2">Lead Status Distribution</h3>
                        <ReactApexChart
                            series={leadStatusChartData.series}
                            options={leadStatusChartData.options}
                            type="donut"
                            height={300}
                        />
                    </div>
                )}
                {leadStatusChartData && (
                    <div className="bg-white dark:bg-black rounded-lg overflow-hidden p-4 w-full md:w-1/2">
                        <h3 className="text-lg font-semibold text-center mb-2">Lead Value Distribution</h3>
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
