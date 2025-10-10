export const toLocalTime=(timestamp: string): string => {
    const isoTimestamp=timestamp.replace(" ", "T");
    const date=new Date(isoTimestamp);
    return date.toLocaleString();
};