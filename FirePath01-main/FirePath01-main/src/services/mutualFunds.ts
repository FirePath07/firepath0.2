
export interface NAVData {
    date: string;
    nav: string;
}

export interface SchemeInfo {
    meta: {
        fund_house: string;
        scheme_type: string;
        scheme_category: string;
        scheme_code: number;
        scheme_name: string;
    };
    data: NAVData[];
    status: string;
}

export const getLatestNAV = async (schemeCode: string): Promise<number> => {
    try {
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        const data: SchemeInfo = await response.json();
        if (data.status === 'SUCCESS' && data.data.length > 0) {
            return parseFloat(data.data[0].nav);
        }
        return 0;
    } catch (error) {
        console.error(`Error fetching NAV for scheme ${schemeCode}:`, error);
        return 0;
    }
};
