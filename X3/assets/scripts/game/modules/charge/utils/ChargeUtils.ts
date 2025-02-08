export class ChargeUtils {
    
    static getPayRMBText(price: number) {
        if (price <= 0) {
            return "免费";
        }
        return `${price / 100}元`;
    }
    
}