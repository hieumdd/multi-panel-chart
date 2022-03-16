import * as dayjs from 'dayjs';
import { round } from 'lodash-es';

const formatter = ({ axisDimension, value }: any) =>
    axisDimension === 'x' ? dayjs(value).format('YYYY-MM-DD') : round(value, 2);

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
