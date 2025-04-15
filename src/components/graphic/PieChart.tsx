import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useChat } from '@/context/ChatContext';

const PieChart: React.FC = () => {
    const { messages } = useChat();
    const [chartData, setChartData] = useState<{ name: string, y: number }[]>([]);

    useEffect(() => {
        const messageCountByUser = messages.reduce((acc, message) => {
            if (message.user === 'Sistema') return acc;

            if (!acc[message.user]) {
                acc[message.user] = 0;
            }
            acc[message.user]++;
            return acc;
        }, {} as Record<string, number>);

        const formattedData = Object.entries(messageCountByUser).map(([name, count]) => ({
            name,
            y: count
        }));

        setChartData(formattedData);
    }, [messages]);

    const options = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Distribuição de mensagens por usuário'
        },
        series: [{
            name: 'Mensagens',
            data: chartData
        }],
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)'
        }
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default PieChart;
