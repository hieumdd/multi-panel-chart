import * as dayjs from 'dayjs';

const formatter = ({ axisDimension, value }: any) =>
    axisDimension === 'x' ? dayjs(value).format('YYYY-MM-DD') : value;

const axisPointer = {
    snap: true,
    link: {
        xAxisIndex: 'all',
    },
    label: {
        backgroundColor: '#777',
        formatter,
    },
};

export default axisPointer;
