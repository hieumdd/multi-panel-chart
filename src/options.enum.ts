export type PanelOptions = {
    panel: '1' | '2' | '3' | '4' | '5';
};

export type YAxisOptions = {
    align: 'left' | 'right';
    inverse: boolean;
    mmOverride: boolean;
    mmMin: number;
    mmMax: number;
};

export type SeriesOptions = {
    color: { solid: { color: string } };
    area: boolean;
};

export type EnumObject<T> = {
    [key in keyof T]: {
        displayName: string;
        default_: T[key];
    };
};

export const panelEnum: EnumObject<PanelOptions> = {
    panel: { displayName: 'Panel', default_: '1' },
};

export const yAxisEnum: EnumObject<YAxisOptions> = {
    align: { displayName: 'Align', default_: 'left' },
    inverse: { displayName: 'Inverse', default_: false },
    mmOverride: { displayName: 'Min/Max Override', default_: false },
    mmMin: { displayName: 'Min', default_: 0 },
    mmMax: { displayName: 'Max', default_: 100 },
};

export const seriesEnum: EnumObject<SeriesOptions> = {
    color: { displayName: 'Color', default_: { solid: { color: '#333333' } } },
    area: { displayName: 'Area', default_: false },
};
