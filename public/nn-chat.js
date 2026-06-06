'use strict';
// 一番下を表示
window.addEventListener('load', () => {
  window.scrollTo(0, document.body.scrollHeight);
});

// エンターキー と Ctrlキー（Macの場合はCommandキー）を押していたら送信
const formElement = document.forms['message-form'];
const textareaElement = formElement.elements['content'];
textareaElement.addEventListener('keydown', (event) => {
  // 送信キーを押したら
  if (isPressedSubmitKey(event)) {
    // キーボード入力をキャンセルして送信
    event.preventDefault();
    formElement.submit();
  }
});

// 送信キーを押しているか判定
function isPressedSubmitKey(event) {
  if (event.key !== 'Enter') return false;
  if (event.ctrlKey)return true;
  // MacのCommandキーはmetaKeyという名前
  if (event.metaKey) return true;
}

// ツールチップの有効化
const tooltipTriggerElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
tooltipTriggerElements.forEach((tooltipTriggerElement) => {
  new bootstrap.Tooltip(tooltipTriggerElement);
});

// リアルタイム検索（インクリメンタルサーチ） ---
const searchInput = document.getElementById('search-input');

// 検索バーが存在するページでのみ実行
if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    // 1. 入力されたキーワードを取得し、小文字に揃える（大文字・小文字の区別をなくすため）
    const keyword = event.target.value.toLowerCase();
    
    // 2. 画面上のすべての投稿カード（クラス名が 'card' の要素）を取得
    const postCards = document.querySelectorAll('.card');

    // 3. 各カードを1つずつチェック
    postCards.forEach(card => {
      // カード内のテキスト（投稿者名や本文などすべて）を取得し、小文字に揃える
      const text = card.textContent.toLowerCase();
      
      // キーワードが含まれているか判定
      if (text.includes(keyword)) {
        // 含まれていれば表示する（CSSの display プロパティを空にして元に戻す）
        card.style.display = '';
      } else {
        // 含まれていなければ非表示にする
        card.style.display = 'none';
      }
    });
  });
}

// --- リアルタイム文字数カウンター、超過制限アラート ---
const textarea = document.getElementById('message-textarea');
const counter = document.getElementById('char-counter');
const submitBtn = document.getElementById('submit-btn');
const MAX_CHARS = 140; // 制限文字数

if (textarea && counter && submitBtn) {
  textarea.addEventListener('input', () => {
    const currentLength = textarea.value.length;
    
    // カウンターの数字を更新
    counter.textContent = `${currentLength} / ${MAX_CHARS}`;
    
    if (currentLength > MAX_CHARS) {
      // 制限文字数を超えた場合
      counter.classList.remove('text-muted');
      counter.classList.add('text-danger', 'fw-bold'); // 文字を赤く太字に
      submitBtn.disabled = true; // 送信ボタンを無効化してクリック不能にする
    } else {
      // 制限文字数以内の場合
      counter.classList.remove('text-danger', 'fw-bold');
      counter.classList.add('text-muted'); // 元の薄い灰色に戻す
      submitBtn.disabled = false; // 送信ボタンを有効化
    }
  });
}

// --- 文字サイズ変更（アクセシビリティ対応）---
const toggleSizeBtn = document.getElementById('btn-toggle-size');

// ページ読み込み時に、過去に保存されたCookie（fontSize）があるかチェックする
function getFontSizeCookie() {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; fontSize=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return 'normal'; // 見つからなければデフォルトは標準（normal）
}

// 実際の文字サイズ（large または normal）を画面に適用する共通関数
function applyFontSize(size) {
  const textElements = document.querySelectorAll('p.card-text');
  
  textElements.forEach(el => {
    if (size === 'large') {
      el.classList.add('large-text');
    } else {
      el.classList.remove('large-text');
    }
  });

  // ボタンのテキストも現在の状態に合わせる
  if (size === 'large') {
    toggleSizeBtn.textContent = '文字サイズを標準に';
  } else {
    toggleSizeBtn.textContent = '文字サイズを大きく';
  }
}

if (toggleSizeBtn) {
  // 1. ページを開いた瞬間にCookieを読み込んで、前回のサイズを自動再現する
  const savedSize = getFontSizeCookie();
  applyFontSize(savedSize);

  // 2. ボタンがクリックされたときの処理
  toggleSizeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    
    // 現在のCookieの状態を見て、次のサイズを決定する
    const currentSize = getFontSizeCookie();
    const nextSize = (currentSize === 'large') ? 'normal' : 'large';
    
    // 画面の文字サイズを変更
    applyFontSize(nextSize);
    
    // 新しい状態をCookieに保存（有効期限は30日間、サイト全体で有効）
    const maxAge = 30 * 24 * 60 * 60; // 秒数（30日）
    document.cookie = `fontSize=${nextSize}; max-age=${maxAge}; path=/; SameSite=Lax`;
  });
}