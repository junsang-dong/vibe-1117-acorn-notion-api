# 📝 Notion 블로그 자동 발행기

Notion API를 활용하여 Notion 데이터베이스의 콘텐츠를 자동으로 블로그에 발행하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🔍 Notion 데이터베이스에서 게시글 목록 조회
- 📄 게시글 제목, 본문, 태그, 이미지 URL 자동 추출
- 📝 Notion 블록을 Markdown 형식으로 자동 변환
- 🚀 원클릭 게시글 발행
- ✅ 게시 완료 알림 표시
- 🎨 모던하고 반응형 UI

## 🛠️ 기술 스택

### Backend
- Node.js
- Express.js
- @notionhq/client (Notion API SDK)

### Frontend
- Vanilla JavaScript
- HTML5
- CSS3

## 📋 사전 요구사항

1. **Node.js** (v14 이상)
2. **Notion 계정** 및 **Integration Token**
3. **Notion Database** 설정

## 🚀 설치 및 실행

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

\`\`\`env
# Notion Integration Token
NOTION_TOKEN=your_notion_integration_token_here

# Notion Database ID
NOTION_DATABASE_ID=your_database_id_here

# Server Port
PORT=3000

# Blog API Endpoint (선택사항)
BLOG_API_URL=https://your-blog-api.com/posts
BLOG_API_KEY=your_blog_api_key_here
\`\`\`

📌 **env.example.txt** 파일을 참고하세요.

### 3. 서버 실행

#### 개발 모드 (자동 재시작)
\`\`\`bash
npm run dev
\`\`\`

#### 프로덕션 모드
\`\`\`bash
npm start
\`\`\`

서버가 실행되면 브라우저에서 `http://localhost:3000`으로 접속합니다.

## 🔧 Notion 설정 가이드

### 1. Notion Integration 생성

1. [Notion Developers](https://www.notion.com/my-integrations) 페이지로 이동
2. **"+ New integration"** 클릭
3. Integration 이름 입력 (예: "Blog Publisher")
4. 권한 설정:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
5. **"Submit"** 클릭
6. **Internal Integration Token** 복사 → `.env` 파일의 `NOTION_TOKEN`에 입력

### 2. Notion Database 생성

1. Notion에서 새로운 페이지 생성
2. **Table - Inline** 또는 **Table - Full page** 선택
3. 다음 속성(Properties) 추가:

| 속성 이름 | 타입 | 설명 |
|---------|------|------|
| **Title** (또는 제목, Name) | Title | 게시글 제목 |
| **Status** (또는 상태) | Select | 발행 상태 (발행 준비, 발행 완료) |
| **Tags** (또는 태그) | Multi-select | 게시글 태그 |
| **Image** (또는 이미지) | Files & media | 대표 이미지 |
| **Created** | Created time | 생성 시간 (자동) |

4. Status 속성에 다음 옵션 추가:
   - 📝 **발행 준비** (게시 대기 중)
   - ✅ **발행 완료** (게시 완료)

### 3. Database를 Integration에 연결

1. 생성한 Database 페이지 열기
2. 우측 상단 **"..."** 메뉴 클릭
3. **"Add connections"** 선택
4. 생성한 Integration 선택
5. **"Confirm"** 클릭

### 4. Database ID 확인

Database 페이지의 URL에서 ID를 확인합니다:

\`\`\`
https://www.notion.so/{workspace_name}/{database_id}?v=...
                                        ^^^^^^^^^^^^^^^^
                                        이 부분이 Database ID
\`\`\`

복사한 Database ID를 `.env` 파일의 `NOTION_DATABASE_ID`에 입력합니다.

## 📖 사용 방법

### 1. 게시글 작성

1. Notion Database에 새로운 페이지(행) 추가
2. 제목, 태그, 이미지 설정
3. 페이지 본문에 콘텐츠 작성
4. **Status**를 **"발행 준비"**로 설정

### 2. 게시글 발행

1. 웹 애플리케이션(`http://localhost:3000`) 접속
2. "발행 준비" 상태인 게시글 목록 확인
3. 발행할 게시글 클릭
4. 미리보기 확인
5. **"🚀 발행하기"** 버튼 클릭
6. **"게시 완료!"** 알림 확인

### 3. 발행 후

- Notion Database의 Status가 자동으로 **"발행 완료"**로 변경됩니다
- 발행된 게시글은 목록에서 사라집니다

## 🎯 API 엔드포인트

### GET `/api/posts`
발행 준비 상태인 게시글 목록을 가져옵니다.

**Response:**
\`\`\`json
{
  "success": true,
  "posts": [
    {
      "id": "page_id",
      "title": "게시글 제목",
      "tags": ["태그1", "태그2"],
      "status": "발행 준비",
      "imageUrl": "https://...",
      "created": "2025-10-16T...",
      "lastEdited": "2025-10-16T..."
    }
  ]
}
\`\`\`

### GET `/api/posts/:id`
특정 게시글의 상세 정보와 Markdown 변환된 본문을 가져옵니다.

**Response:**
\`\`\`json
{
  "success": true,
  "post": {
    "id": "page_id",
    "title": "게시글 제목",
    "tags": ["태그1", "태그2"],
    "imageUrl": "https://...",
    "content": "# Markdown 형식의 본문...",
    "created": "2025-10-16T...",
    "lastEdited": "2025-10-16T..."
  }
}
\`\`\`

### POST `/api/publish`
게시글을 발행하고 Notion Status를 업데이트합니다.

**Request:**
\`\`\`json
{
  "postId": "page_id"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "게시글이 성공적으로 발행되었습니다!",
  "post": {
    "title": "게시글 제목",
    "content": "Markdown 본문",
    "tags": ["태그1", "태그2"],
    "imageUrl": "https://...",
    "publishedAt": "2025-10-16T..."
  }
}
\`\`\`

### GET `/api/database/properties`
Database 속성 정보를 가져옵니다 (디버깅용).

**Response:**
\`\`\`json
{
  "success": true,
  "properties": [
    {
      "name": "Title",
      "type": "title",
      "id": "property_id"
    }
  ]
}
\`\`\`

## 📁 프로젝트 구조

\`\`\`
notion-blog-publisher/
├── public/                # 프론트엔드 파일
│   ├── index.html        # 메인 HTML
│   ├── styles.css        # 스타일시트
│   └── script.js         # JavaScript 로직
├── utils/                # 유틸리티 함수
│   └── notionToMarkdown.js  # Notion → Markdown 변환
├── server.js             # Express 서버
├── package.json          # 프로젝트 설정
├── .env                  # 환경 변수 (생성 필요)
├── .gitignore           # Git 무시 파일
└── README.md            # 프로젝트 문서
\`\`\`

## 🔄 Markdown 변환 지원 블록

- ✅ 제목 (Heading 1, 2, 3)
- ✅ 단락 (Paragraph)
- ✅ 볼드, 이탤릭, 취소선, 밑줄
- ✅ 인라인 코드
- ✅ 코드 블록
- ✅ 불릿 리스트
- ✅ 번호 리스트
- ✅ 체크박스 (To-do)
- ✅ 인용구 (Quote)
- ✅ 콜아웃 (Callout)
- ✅ 구분선 (Divider)
- ✅ 이미지
- ✅ 링크
- ✅ 비디오, 북마크

## 🎨 UI 특징

- 🌈 그라데이션 헤더
- 📱 완전한 반응형 디자인
- 🎭 부드러운 애니메이션
- 💡 직관적인 인터페이스
- 🎯 모달 미리보기
- 🔔 토스트 알림

## 🔗 외부 블로그 API 연동

실제 블로그 플랫폼에 게시하려면 `server.js`의 `/api/publish` 엔드포인트를 수정하세요:

\`\`\`javascript
// server.js의 POST /api/publish 내부
const fetch = require('node-fetch'); // npm install node-fetch 필요

const blogResponse = await fetch(process.env.BLOG_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.BLOG_API_KEY}\`
  },
  body: JSON.stringify({
    title: postData.title,
    content: postData.content,
    tags: postData.tags,
    featured_image: postData.imageUrl
  })
});

const blogResult = await blogResponse.json();
\`\`\`

## 🐛 문제 해결

### "데이터베이스를 찾을 수 없습니다"
- Database가 Integration에 연결되어 있는지 확인
- Database ID가 정확한지 확인

### "권한이 없습니다"
- Integration의 권한 설정 확인 (Read, Update, Insert)
- Integration Token이 올바른지 확인

### "게시글이 표시되지 않습니다"
- Status 속성이 "발행 준비"로 설정되어 있는지 확인
- Database 속성 이름 확인 (`Title`, `Status`, `Tags` 등)
- `/api/database/properties`로 실제 속성 이름 확인

## 📚 참고 자료

- [Notion API 문서](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Notion API 통합 생성](https://developers.notion.com/docs/create-a-notion-integration)

## 📝 라이선스

MIT License

## 👨‍💻 개발자

VBC30M-C3 - Acorn Notion API Project

---

**Made with ❤️ using Notion API**

