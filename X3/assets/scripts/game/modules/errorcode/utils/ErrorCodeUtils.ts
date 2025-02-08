export class ErrorCodeUtils {
    
    static getErrorCodeI18nId(code: number): string {
        return `i18n:errorCode:${code}`;
    }
}