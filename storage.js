// 📦 데이터 저장소 관리 (로컬 스토리지)

const StorageManager = {
    // 키 정의
    KEYS: {
        TRANSACTIONS: 'wannaSave_transactions',
        API_CONFIG: 'wannaSave_apiConfig',
        API_USAGE: 'wannaSave_apiUsage',
        LAST_API_RESET: 'wannaSave_lastApiReset'
    },

    /**
     * 거래 데이터 저장
     */
    saveTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now().toString();
        transaction.createdAt = new Date().toISOString();
        transactions.push(transaction);
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
        return transaction;
    },

    /**
     * 모든 거래 조회
     */
    getTransactions() {
        const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * 특정 월의 거래 조회
     */
    getTransactionsByMonth(year, month) {
        const transactions = this.getTransactions();
        return transactions.filter(t => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() === month;
        });
    },

    /**
     * 거래 삭제
     */
    deleteTransaction(id) {
        let transactions = this.getTransactions();
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    /**
     * API 설정 저장
     */
    saveApiConfig(config) {
        localStorage.setItem(this.KEYS.API_CONFIG, JSON.stringify(config));
    },

    /**
     * API 설정 조회
     */
    getApiConfig() {
        const data = localStorage.getItem(this.KEYS.API_CONFIG);
        return data ? JSON.parse(data) : {
            customKey: '',
            usageLimit: 1000,
            isCustom: false
        };
    },

    /**
     * API 사용량 기록
     */
    recordApiUsage() {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        
        let usage = this.getApiUsage();
        
        // 월이 바뀌었는지 확인
        const lastReset = localStorage.getItem(this.KEYS.LAST_API_RESET);
        if (lastReset !== monthKey) {
            usage = 0;
            localStorage.setItem(this.KEYS.LAST_API_RESET, monthKey);
        }
        
        usage++;
        localStorage.setItem(this.KEYS.API_USAGE, usage.toString());
        return usage;
    },

    /**
     * API 사용량 조회
     */
    getApiUsage() {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        const lastReset = localStorage.getItem(this.KEYS.LAST_API_RESET);
        
        if (lastReset !== monthKey) {
            localStorage.setItem(this.KEYS.LAST_API_RESET, monthKey);
            localStorage.setItem(this.KEYS.API_USAGE, '0');
            return 0;
        }
        
        const usage = localStorage.getItem(this.KEYS.API_USAGE);
        return usage ? parseInt(usage) : 0;
    },

    /**
     * API 사용량 초기화
     */
    resetApiUsage() {
        const today = new Date();
        const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
        localStorage.setItem(this.KEYS.LAST_API_RESET, monthKey);
        localStorage.setItem(this.KEYS.API_USAGE, '0');
    },

    /**
     * 모든 데이터 내보내기 (JSON)
     */
    exportData() {
        const data = {
            transactions: this.getTransactions(),
            apiConfig: this.getApiConfig(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    /**
     * 데이터 가져오기 (JSON)
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.transactions) {
                localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
            }
            return true;
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            return false;
        }
    },

    /**
     * 모든 데이터 삭제
     */
    clearAllData() {
        localStorage.removeItem(this.KEYS.TRANSACTIONS);
        localStorage.removeItem(this.KEYS.API_CONFIG);
        localStorage.removeItem(this.KEYS.API_USAGE);
        localStorage.removeItem(this.KEYS.LAST_API_RESET);
    }
};
