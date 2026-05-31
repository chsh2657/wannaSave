// 🎯 메인 앱 로직

// 전역 상태
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentFilter = 'all';

// 🚀 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // 카메라 초기화
    await CameraManager.init();

    // 초기 UI 렌더링
    initializeApp();
    renderDashboard();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 초기 설정 날짜
    document.getElementById('entryDate').valueAsDate = new Date();
});

/**
 * 앱 초기화
 */
function initializeApp() {
    // 기본 API 설정 초기화
    let config = StorageManager.getApiConfig();
    if (!config.customKey) {
        config = {
            customKey: '',
            usageLimit: 1000,
            isCustom: false
        };
        StorageManager.saveApiConfig(config);
    }

    updateApiStatus();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 탭 네비게이션
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // 대시보드
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderDashboard();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderDashboard();
    });

    // 거래 필터
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTransactionsList();
        });
    });

    // 수동 입력 폼
    document.getElementById('manualForm').addEventListener('submit', handleManualSubmit);

    // 카메라 버튼
    document.getElementById('captureBtn').addEventListener('click', handleCameraCapture);
    document.getElementById('retakeBtn').addEventListener('click', handleRetake);
    document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
    document.getElementById('saveAnalyzedBtn').addEventListener('click', handleSaveAnalyzed);

    // API 설정
    document.getElementById('saveApiKey').addEventListener('click', handleSaveApiKey);
    document.getElementById('resetApiKey').addEventListener('click', handleResetApiKey);
    document.getElementById('toggleApiKeyVisibility').addEventListener('click', toggleApiKeyVisibility);

    // 데이터 관리
    document.getElementById('exportDataBtn').addEventListener('click', handleExportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', handleImportData);
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);

    // 달력 네비게이션
    document.getElementById('calPrevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    document.getElementById('calNextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

/**
 * 탭 전환
 */
function switchTab(tabName) {
    // 모든 탭 숨기기
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // 모든 버튼 비활성화
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 선택된 탭 표시
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 달력 탭 렌더링
    if (tabName === 'calendar') {
        renderCalendar();
    }
}

/**
 * 대시보드 렌더링
 */
function renderDashboard() {
    const transactions = StorageManager.getTransactionsByMonth(currentYear, currentMonth);

    // 월 표시 업데이트
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('currentMonth').textContent = `${currentYear}년 ${monthNames[currentMonth]}`;

    // 통계 계산
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    // 통계 표시
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpense').textContent = formatCurrency(expense);
    document.getElementById('totalBalance').textContent = formatCurrency(balance);

    // 카테고리별 통계
    renderCategoryStats(transactions);

    // 거래 내역
    renderTransactionsList();
}

/**
 * 카테고리별 통계 렌더링
 */
function renderCategoryStats(transactions) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryStats = {};

    expenseTransactions.forEach(t => {
        const category = t.category || '기타';
        categoryStats[category] = (categoryStats[category] || 0) + t.amount;
    });

    const statsHtml = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-amount">${formatCurrency(amount)}</span>
            </div>
        `)
        .join('');

    const categoryStatsDiv = document.getElementById('categoryStats');
    if (statsHtml) {
        categoryStatsDiv.innerHTML = statsHtml;
    } else {
        categoryStatsDiv.innerHTML = '<p style="text-align: center; color: #9ca3af;">이 달 지출이 없습니다.</p>';
    }
}

/**
 * 거래 내역 렌더링
 */
function renderTransactionsList() {
    const transactions = StorageManager.getTransactionsByMonth(currentYear, currentMonth);

    let filtered = transactions;
    if (currentFilter === 'income') {
        filtered = transactions.filter(t => t.type === 'income');
    } else if (currentFilter === 'expense') {
        filtered = transactions.filter(t => t.type === 'expense');
    }

    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const listHtml = sorted
        .map(transaction => `
            <div class="transaction-item ${transaction.type}">
                <div class="transaction-left">
                    <div class="transaction-category">${transaction.category || '기타'}</div>
                    <div class="transaction-description">${transaction.description || '(설명 없음)'}</div>
                    <div class="transaction-date">${formatDate(transaction.date)}</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')" title="삭제">🗑️</button>
                    </div>
                </div>
            </div>
        `)
        .join('');

    const transactionsList = document.getElementById('transactionsList');
    if (listHtml) {
        transactionsList.innerHTML = listHtml;
    } else {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">거래 내역이 없습니다</div>
            </div>
        `;
    }
}

/**
 * 달력 렌더링
 */
function renderCalendar() {
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    document.getElementById('calCurrentMonth').textContent = `${currentYear}년 ${monthNames[currentMonth]}`;

    // 달의 첫 날과 마지막 날 계산
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // 모든 거래 조회
    const allTransactions = StorageManager.getTransactions();

    // 날짜별 거래 정보 구축
    const dayTransactions = {};
    allTransactions.forEach(t => {
        const dateKey = t.date;
        if (!dayTransactions[dateKey]) {
            dayTransactions[dateKey] = { income: 0, expense: 0, transactions: [] };
        }
        dayTransactions[dateKey][t.type === 'income' ? 'income' : 'expense'] += t.amount;
        dayTransactions[dateKey].transactions.push(t);
    });

    // 달력 그리기
    const calendarDaysDiv = document.getElementById('calendarDays');
    let daysHtml = '';
    const today = new Date();

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];

        const isCurrentMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        const isToday = date.toDateString() === today.toDateString();
        const trans = dayTransactions[dateKey];

        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';

        let amountHtml = '';
        if (trans) {
            if (trans.income > 0) {
                amountHtml += `<div class="calendar-day-income">+${formatCurrencyShort(trans.income)}</div>`;
            }
            if (trans.expense > 0) {
                amountHtml += `<div class="calendar-day-expense">-${formatCurrencyShort(trans.expense)}</div>`;
            }
        }

        daysHtml += `
            <div class="${dayClass}" onclick="selectCalendarDay('${dateKey}', this)">
                <div class="calendar-day-dot" ${!trans ? 'style="display:none;"' : ''}></div>
                <div class="calendar-day-number">${date.getDate()}</div>
                <div class="calendar-day-amount">${amountHtml}</div>
            </div>
        `;
    }

    calendarDaysDiv.innerHTML = daysHtml;
}

/**
 * 달력에서 날짜 선택
 */
function selectCalendarDay(dateKey, element) {
    // 이전 선택 제거
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });

    // 새로 선택
    element.classList.add('selected');

    // 해당 날짜의 거래 표시
    const allTransactions = StorageManager.getTransactions();
    const dayTrans = allTransactions.filter(t => t.date === dateKey);

    const detailSection = document.getElementById('calendarDetailSection');
    const dayTitle = document.getElementById('selectedDateTitle');
    const dayTransDiv = document.getElementById('calendarDayTransactions');

    const date = new Date(dateKey + 'T00:00:00');
    dayTitle.textContent = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    if (dayTrans.length > 0) {
        const sorted = dayTrans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const transHtml = sorted
            .map(transaction => `
                <div class="transaction-item ${transaction.type}">
                    <div class="transaction-left">
                        <div class="transaction-category">${transaction.category || '기타'}</div>
                        <div class="transaction-description">${transaction.description || '(설명 없음)'}</div>
                        <div class="transaction-date">${formatDate(transaction.date)}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                        </div>
                        <div class="transaction-actions">
                            <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')" title="삭제">🗑️</button>
                        </div>
                    </div>
                </div>
            `)
            .join('');
        dayTransDiv.innerHTML = transHtml;
    } else {
        dayTransDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">이 날짜에 거래가 없습니다</div>
            </div>
        `;
    }

    detailSection.style.display = 'block';
}

/**
 * 거래 삭제
 */
function deleteTransaction(id) {
    if (confirm('이 거래를 삭제하시겠습니까?')) {
        StorageManager.deleteTransaction(id);
        renderDashboard();
        renderCalendar();
        showToast('거래가 삭제되었습니다', 'success');
    }
}

/**
 * 수동 입력 폼 제출
 */
function handleManualSubmit(e) {
    e.preventDefault();

    const transaction = {
        date: document.getElementById('entryDate').value,
        type: document.querySelector('input[name="entryType"]:checked').value,
        category: document.getElementById('entryCategory').value,
        amount: parseInt(document.getElementById('entryAmount').value),
        description: document.getElementById('entryDescription').value
    };

    StorageManager.saveTransaction(transaction);
    document.getElementById('manualForm').reset();
    document.getElementById('entryDate').valueAsDate = new Date();

    renderDashboard();
    renderCalendar();
    showToast('거래가 저장되었습니다', 'success');
}

/**
 * 카메라 촬영
 */
function handleCameraCapture() {
    CameraManager.capturePhoto();
    CameraManager.displayPhoto();

    document.getElementById('captureBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'inline-flex';
    document.getElementById('analyzeBtn').style.display = 'inline-flex';
}

/**
 * 다시 촬영
 */
function handleRetake() {
    CameraManager.resetCamera();

    document.getElementById('captureBtn').style.display = 'inline-flex';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('analyzeBtn').style.display = 'none';
    document.getElementById('analysisResult').style.display = 'none';
    document.getElementById('analysisLoading').style.display = 'none';
}

/**
 * AI 분석
 */
async function handleAnalyze() {
    if (!CameraManager.currentPhoto) {
        showToast('먼저 사진을 촬영해주세요', 'warning');
        return;
    }

    document.getElementById('analysisLoading').style.display = 'flex';
    document.getElementById('analysisResult').style.display = 'none';

    try {
        const result = await APIManager.analyzeReceipt(CameraManager.currentPhoto);

        // 분석 결과 폼 채우기
        document.getElementById('analyzeAmount').value = result.amount || '';
        document.getElementById('analyzeDescription').value = result.description || '';
        document.getElementById('analyzeCategory').value = result.category || '기타';
        document.getElementById('analyzeType').value = 'expense';

        document.getElementById('analysisLoading').style.display = 'none';
        document.getElementById('analysisResult').style.display = 'block';

        showToast(`분석 완료 (신뢰도: ${Math.round(result.confidence * 100)}%)`, 'success');
    } catch (error) {
        document.getElementById('analysisLoading').style.display = 'none';
        showToast('분석에 실패했습니다. 다시 시도해주세요.', 'error');
        console.error(error);
    }
}

/**
 * 분석된 데이터 저장
 */
function handleSaveAnalyzed() {
    const amount = parseInt(document.getElementById('analyzeAmount').value);
    if (!amount || amount <= 0) {
        showToast('금액을 입력해주세요', 'warning');
        return;
    }

    const transaction = {
        date: new Date().toISOString().split('T')[0],
        type: document.getElementById('analyzeType').value,
        category: document.getElementById('analyzeCategory').value,
        amount: amount,
        description: document.getElementById('analyzeDescription').value
    };

    StorageManager.saveTransaction(transaction);

    // UI 초기화
    handleRetake();
    renderDashboard();
    renderCalendar();
    showToast('거래가 저장되었습니다', 'success');
}

/**
 * API 키 저장
 */
async function handleSaveApiKey() {
    const apiKey = document.getElementById('customApiKey').value.trim();

    if (!apiKey) {
        showToast('API 키를 입력해주세요', 'warning');
        return;
    }

    // 키 검증 (선택사항)
    const isValid = await APIManager.validateApiKey(apiKey);
    if (!isValid) {
        showToast('유효하지 않은 API 키입니다', 'error');
        return;
    }

    const config = {
        customKey: apiKey,
        usageLimit: parseInt(document.getElementById('apiUsageLimit').value) || 1000,
        isCustom: true
    };

    StorageManager.saveApiConfig(config);
    updateApiStatus();
    showToast('API 키가 저장되었습니다', 'success');
}

/**
 * API 키 초기화
 */
function handleResetApiKey() {
    if (confirm('API 키를 초기화하고 기본 무료 API를 사용하시겠습니까?')) {
        document.getElementById('customApiKey').value = '';
        document.getElementById('apiUsageLimit').value = '1000';

        const config = {
            customKey: '',
            usageLimit: 1000,
            isCustom: false
        };

        StorageManager.saveApiConfig(config);
        StorageManager.resetApiUsage();
        updateApiStatus();
        showToast('기본 설정으로 초기화되었습니다', 'success');
    }
}

/**
 * API 키 표시/숨기기
 */
function toggleApiKeyVisibility() {
    const input = document.getElementById('customApiKey');
    const btn = document.getElementById('toggleApiKeyVisibility');
    
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈 숨기기';
    } else {
        input.type = 'password';
        btn.textContent = '👁️ 보기';
    }
}

/**
 * API 상태 업데이트
 */
function updateApiStatus() {
    const config = StorageManager.getApiConfig();
    const status = APIManager.getApiStatus();

    const statusDiv = document.getElementById('customApiStatus');
    if (config.isCustom && config.customKey) {
        statusDiv.innerHTML = '<span class="badge badge-active">✓ 커스텀 API 설정됨</span>';
    } else {
        statusDiv.innerHTML = '<span class="badge badge-inactive">기본 무료 API 사용 중</span>';
    }

    document.getElementById('currentUsage').textContent = status.usage;
    document.getElementById('usageLimit').textContent = status.limit;
    document.getElementById('usageFill').style.width = `${status.percentUsed}%`;
}

/**
 * 데이터 내보내기
 */
function handleExportData() {
    const data = StorageManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wannaSave_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터가 내보내졌습니다', 'success');
}

/**
 * 데이터 가져오기
 */
function handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const success = StorageManager.importData(event.target.result);
            if (success) {
                renderDashboard();
                showToast('데이터를 가져왔습니다', 'success');
            } else {
                showToast('데이터 가져오기에 실패했습니다', 'error');
            }
        } catch (error) {
            showToast('파일 읽기에 실패했습니다', 'error');
        }
    };
    reader.readAsText(file);
    document.getElementById('importFile').value = '';
}

/**
 * 데이터 삭제
 */
function handleClearData() {
    if (confirm('정말 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        if (confirm('한번 더 확인합니다. 정말 삭제하시겠습니까?')) {
            StorageManager.clearAllData();
            renderDashboard();
            showToast('모든 데이터가 삭제되었습니다', 'success');
        }
    }
}

/**
 * 유틸리티 함수
 */

function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrencyShort(amount) {
    if (amount >= 10000) {
        return `${Math.floor(amount / 10000)}만`;
    } else if (amount >= 1000) {
        return `${Math.floor(amount / 1000)}천`;
    }
    return amount.toString();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
