import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';

export const dateFormatter = valueFormatter.create({ format: 'D' });

export const seriesFormatter = (format: string) => valueFormatter.create({ format });
