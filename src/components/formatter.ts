import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';
import ValueFormatterOptions = valueFormatter.ValueFormatterOptions;

import { ValueFormat } from '../enumObjects';

const options: Record<ValueFormat, ValueFormatterOptions> = {
    raw: { value: 1, precision: 2 },
    percentage: { format: '0.00 %;-0.00 %;0.00 %', precision: 2 },
    thousand: { value: 1001, precision: 2 },
    million: { value: 1e6, precision: 2 },
};

const formatter = Object.fromEntries(
    Object.entries(options).map(([id, option]) => [
        id,
        valueFormatter.create(option),
    ]),
);

export const nativeFormatter = (format: string) => valueFormatter.create({ format });
export default formatter;
