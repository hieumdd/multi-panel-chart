import * as dayjs from 'dayjs';
import { round } from 'lodash-es';

import { dateFormatter } from './formatter';

const formatter = ({ axisDimension, value }: any) =>
    axisDimension === 'x'
        ? dateFormatter.format(dayjs(value).toDate())
        : round(value, 2);

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
