import { valueFormatter } from 'powerbi-visuals-utils-formattingutils';

const formatter = (format: string) => valueFormatter.create({ format });

export default formatter;
