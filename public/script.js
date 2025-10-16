// API Base URL
const API_BASE_URL = window.location.origin;

// 현재 선택된 게시글 ID
let currentPostId = null;

// 페이지 로드 시 게시글 목록 가져오기
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
});

/**
 * 게시글 목록 로드
 */
async function loadPosts() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const postsContainer = document.getElementById('posts-container');
  const postsList = document.getElementById('posts-list');

  // UI 초기화
  loading.classList.remove('hidden');
  error.classList.add('hidden');
  postsContainer.classList.add('hidden');
  postsList.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`);
    const data = await response.json();

    loading.classList.add('hidden');

    if (!data.success) {
      throw new Error(data.error || '게시글을 불러오는데 실패했습니다.');
    }

    if (data.posts.length === 0) {
      postsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>발행 준비된 게시글이 없습니다.</p>
          <p style="margin-top: 10px; font-size: 0.9rem;">
            Notion 데이터베이스에서 Status를 "발행 준비"로 설정해주세요.
          </p>
        </div>
      `;
    } else {
      data.posts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
      });
    }

    postsContainer.classList.remove('hidden');

  } catch (err) {
    console.error('Error loading posts:', err);
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    document.getElementById('error-message').textContent = err.message;
  }
}

/**
 * 게시글 카드 생성
 */
function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.onclick = () => showPreview(post.id);

  // 날짜 포맷팅
  const date = new Date(post.created).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 이미지가 있는 경우
  const imageHTML = post.imageUrl
    ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-image" onerror="this.style.display='none'">`
    : '';

  // 태그가 있는 경우
  const tagsHTML = post.tags && post.tags.length > 0
    ? `
      <div class="post-meta">
        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
      </div>
    `
    : '';

  card.innerHTML = `
    ${imageHTML}
    <h3 class="post-title">${post.title || '제목 없음'}</h3>
    ${tagsHTML}
    <div class="post-date">📅 ${date}</div>
  `;

  return card;
}

/**
 * 게시글 미리보기 표시
 */
async function showPreview(postId) {
  currentPostId = postId;

  const modal = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalTags = document.getElementById('modal-tags');
  const modalImage = document.getElementById('modal-image');
  const modalContent = document.getElementById('modal-content');

  // 로딩 표시
  modalTitle.textContent = '로딩 중...';
  modalTags.innerHTML = '';
  modalImage.innerHTML = '';
  modalContent.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';
  modal.classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '게시글을 불러오는데 실패했습니다.');
    }

    const post = data.post;

    // 제목
    modalTitle.textContent = post.title || '제목 없음';

    // 태그
    if (post.tags && post.tags.length > 0) {
      modalTags.innerHTML = `
        <div class="post-tags">
          ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>
      `;
    } else {
      modalTags.innerHTML = '';
    }

    // 이미지
    if (post.imageUrl) {
      modalImage.innerHTML = `<img src="${post.imageUrl}" alt="${post.title}" onerror="this.style.display='none'">`;
    } else {
      modalImage.innerHTML = '';
    }

    // Markdown 콘텐츠 (간단한 HTML 변환)
    modalContent.innerHTML = `
      <div class="markdown-content">
        ${convertMarkdownToHTML(post.content)}
      </div>
    `;

  } catch (err) {
    console.error('Error loading post preview:', err);
    modalContent.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger-color);">
        <p>⚠️ ${err.message}</p>
      </div>
    `;
  }
}

/**
 * 미리보기 모달 닫기
 */
function closePreview() {
  const modal = document.getElementById('preview-modal');
  modal.classList.add('hidden');
  currentPostId = null;
}

/**
 * 게시글 발행
 */
async function publishPost() {
  if (!currentPostId) {
    return;
  }

  const publishBtn = document.getElementById('publish-btn');
  const originalText = publishBtn.innerHTML;

  // 버튼 비활성화
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> 발행 중...';

  try {
    const response = await fetch(`${API_BASE_URL}/api/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        postId: currentPostId
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || '게시글 발행에 실패했습니다.');
    }

    // 성공 알림 표시
    showToast('게시 완료!', data.message);

    // 모달 닫기
    closePreview();

    // 게시글 목록 새로고침
    setTimeout(() => {
      loadPosts();
    }, 1000);

  } catch (err) {
    console.error('Error publishing post:', err);
    alert(`발행 실패: ${err.message}`);
    publishBtn.disabled = false;
    publishBtn.innerHTML = originalText;
  }
}

/**
 * 토스트 알림 표시
 */
function showToast(title, message) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastMessage = document.getElementById('toast-message');

  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.remove('hidden');

  // 3초 후 자동으로 숨기기
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * 간단한 Markdown을 HTML로 변환
 */
function convertMarkdownToHTML(markdown) {
  if (!markdown) {
    return '<p>내용이 없습니다.</p>';
  }

  let html = markdown;

  // 헤딩
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 볼드, 이탤릭
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 취소선
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // 인라인 코드
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 링크
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // 이미지
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 16px 0;">');

  // 리스트
  html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // 번호 리스트
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

  // 구분선
  html = html.replace(/^---$/gim, '<hr>');

  // 블록쿼트
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

  // 단락
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  // 빈 단락 제거
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  const modal = document.getElementById('preview-modal');
  if (event.target === modal) {
    closePreview();
  }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const modal = document.getElementById('preview-modal');
    if (!modal.classList.contains('hidden')) {
      closePreview();
    }
  }
});

