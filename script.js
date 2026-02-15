let activeSlot = null;
const usedCards = new Set();

// אתחול בעת טעינת הדף
window.onload = function() {
    initCardSelector();
    
    // סריקת קלפים שכבר נמצאים ב-HTML (למשל היד המוכנה של שחקן 1)
    document.querySelectorAll('.card-slot.filled').forEach(slot => {
        if(slot.dataset.card) {
            usedCards.add(slot.dataset.card);
        }
        slot.onclick = function() { openSelector(this); };
    });
};

/* --- ניהול ממשק המשתמש (UI) --- */

function initCardSelector() {
    const grid = document.getElementById('cardGrid');
    const suits = [
        { code: 's', symbol: '♠' },
        { code: 'h', symbol: '♥' },
        { code: 'c', symbol: '♣' },
        { code: 'd', symbol: '♦' }
    ];
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    // יצירת הגריד: שורות של Ranks, עמודות של Suits
    ranks.forEach(rank => {
        suits.forEach(suit => {
            const btn = document.createElement('button');
            const cardCode = rank + suit.code;
            
            btn.className = 'select-card-btn';
            // צבע לאדום אם זה לב או יהלום
            if (suit.code === 'h' || suit.code === 'd') {
                btn.style.color = '#d32f2f'; 
            }
            
            btn.innerHTML = `<span>${rank}</span><span>${suit.symbol}</span>`;
            btn.dataset.card = cardCode;
            
            btn.onclick = () => selectCard(cardCode);
            grid.appendChild(btn);
        });
    });
}

function openSelector(slot) {
    activeSlot = slot;
    
    // מעבר על כל הכפתורים בגריד וסימון מה תפוס
    document.querySelectorAll('.select-card-btn').forEach(btn => {
        const code = btn.dataset.card;
        // אם הקלף תפוס ע"י סלוט אחר - נטרל אותו
        // אם הוא תפוס ע"י הסלוט הנוכחי - אפשר אותו (כדי שנוכל לבחור בו שוב אם נרצה)
        if (usedCards.has(code) && activeSlot.dataset.card !== code) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });

    document.getElementById('selector-modal').style.display = 'flex';
}

function closeSelector() {
    document.getElementById('selector-modal').style.display = 'none';
    activeSlot = null;
}

function selectCard(cardCode) {
    if (!activeSlot) return;

    // הסרת הקלף הישן מהרשימה "תפוסים"
    if (activeSlot.dataset.card) {
        usedCards.delete(activeSlot.dataset.card);
    }

    // שמירת החדש
    activeSlot.dataset.card = cardCode;
    usedCards.add(cardCode);

    // עדכון ויזואלי של הסלוט
    renderSlot(activeSlot, cardCode);
    
    closeSelector();
    
    // איפוס תוצאות חישוב קודם כי שינינו קלפים
    resetResultsUI();
}

function renderSlot(slot, code) {
    slot.classList.remove('empty');
    slot.classList.add('filled');
    
    const rank = code[0];
    const suit = code[1];
    const suitSymbols = {'h':'♥', 'd':'♦', 's':'♠', 'c':'♣'};
    
    slot.innerHTML = `
        <span class="card-rank">${rank}</span>
        <span class="card-suit suit-${suit}">${suitSymbols[suit]}</span>
    `;
    
    // כדי שנוכל ללחוץ שוב לשנות
    slot.onclick = function() { openSelector(this); };
}

function resetAll() {
    document.querySelectorAll('.card-slot').forEach(slot => {
        slot.className = 'card-slot empty';
        slot.innerHTML = '';
        delete slot.dataset.card;
        slot.onclick = function() { openSelector(this); };
    });
    usedCards.clear();
    resetResultsUI();
}

function resetResultsUI() {
    document.getElementById('p1-bar').style.width = '0%';
    document.getElementById('p1-pct').innerText = '0%';
    document.getElementById('p2-bar').style.width = '0%';
    document.getElementById('p2-pct').innerText = '0%';
    document.getElementById('tie-pct').innerText = '0%';
}

/* --- מנוע החישוב (Logic) --- */

async function runCalculation() {
    const h1 = getCardsFromSection('p1-slots');
    const h2 = getCardsFromSection('p2-slots');
    const board = getCardsFromSection('board-slots');

    if (h1.length < 4 || h2.length < 4) {
        alert("Please select 4 cards for each player.");
        return;
    }

    // UI Loading
    document.getElementById('calcBtn').disabled = true;
    document.getElementById('calcBtn').innerText = "Calculating...";
    document.getElementById('loadingMsg').style.display = 'block';

    // השהיה קטנה כדי לתת לדפדפן לרנדר את ה-Loading לפני שהמעבד נתקע
    setTimeout(() => {
        calculateMonteCarlo(h1, h2, board);
        
        // סיום
        document.getElementById('calcBtn').disabled = false;
        document.getElementById('calcBtn').innerText = "Calculate Equity";
        document.getElementById('loadingMsg').style.display = 'none';
    }, 50);
}

function getCardsFromSection(id) {
    const cards = [];
    document.querySelectorAll(`#${id} .card-slot.filled`).forEach(slot => {
        let code = slot.dataset.card;
        // המרת פורמט לספרייה: אות ראשונה גדולה, שנייה קטנה (כבר בפורמט נכון אבל ליתר ביטחון)
        cards.push(code.charAt(0).toUpperCase() + code.charAt(1).toLowerCase());
    });
    return cards;
}

// פונקציות עזר לאומהה
function getCombinations(arr, size) {
    const res = [];
    function helper(temp, start) {
        if (temp.length === size) { res.push(temp); return; }
        for (let i = start; i < arr.length; i++) {
            helper(temp.concat(arr[i]), i + 1);
        }
    }
    helper([], 0);
    return res;
}

function getBestOmahaHand(hand, board) {
    let best = null;
    const handCombos = getCombinations(hand, 2);
    const boardCombos = getCombinations(board, 3);
    
    for (let hc of handCombos) {
        for (let bc of boardCombos) {
            const fiveCards = hc.concat(bc);
            const solved = Hand.solve(fiveCards); // ספריית pokersolver
            if (!best || solved.compare(best) === 1) {
                best = solved;
            }
        }
    }
    return best;
}

function calculateMonteCarlo(h1, h2, board) {
    const ITERATIONS = 1500; // אפשר להעלות ל-5000 לדיוק, אבל יאיט את המובייל
    let p1Wins = 0, p2Wins = 0, ties = 0;
    
    // יצירת חפיסה
    const ranks = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    const suits = ['h','d','c','s'];
    let fullDeck = [];
    for(let r of ranks) for(let s of suits) fullDeck.push(r+s);
    
    const known = new Set([...h1, ...h2, ...board]);
    const deck = fullDeck.filter(c => !known.has(c));
    
    for (let i = 0; i < ITERATIONS; i++) {
        // ערבוב פשוט
        for (let j = deck.length - 1; j > 0; j--) {
            const r = Math.floor(Math.random() * (j + 1));
            [deck[j], deck[r]] = [deck[r], deck[j]];
        }
        
        // השלמת בורד
        const needed = 5 - board.length;
        const currentBoard = board.concat(deck.slice(0, needed));
        
        const p1Best = getBestOmahaHand(h1, currentBoard);
        const p2Best = getBestOmahaHand(h2, currentBoard);
        
        const res = p1Best.compare(p2Best);
        if (res === 1) p1Wins++;
        else if (res === -1) p2Wins++; // ספרייה זו מחזירה לפעמים -1 אם השני מנצח
        else ties++; // תלוי מימוש, לפעמים 0 זה תיקו
    }
    
    // עדכון תוצאות
    const p1Val = ((p1Wins / ITERATIONS) * 100).toFixed(1);
    const p2Val = ((p2Wins / ITERATIONS) * 100).toFixed(1);
    const tieVal = ((ties / ITERATIONS) * 100).toFixed(1);
    
    document.getElementById('p1-bar').style.width = p1Val + '%';
    document.getElementById('p1-pct').innerText = p1Val + '%';
    
    document.getElementById('p2-bar').style.width = p2Val + '%';
    document.getElementById('p2-pct').innerText = p2Val + '%';
    
    document.getElementById('tie-pct').innerText = tieVal + '%';
}
