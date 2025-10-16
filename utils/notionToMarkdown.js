/**
 * Notion 블록을 Markdown으로 변환하는 유틸리티 함수
 */

/**
 * 리치 텍스트 배열을 Markdown 문자열로 변환
 */
function richTextToMarkdown(richTextArray) {
  if (!richTextArray || richTextArray.length === 0) {
    return '';
  }

  return richTextArray.map(richText => {
    let text = richText.plain_text;
    
    // 텍스트 스타일 적용
    if (richText.annotations) {
      const { bold, italic, strikethrough, code, underline } = richText.annotations;
      
      if (code) {
        text = `\`${text}\``;
      } else {
        if (bold) text = `**${text}**`;
        if (italic) text = `*${text}*`;
        if (strikethrough) text = `~~${text}~~`;
        if (underline) text = `<u>${text}</u>`;
      }
    }

    // 링크 처리
    if (richText.href) {
      text = `[${text}](${richText.href})`;
    }

    return text;
  }).join('');
}

/**
 * Notion 블록을 Markdown으로 변환
 */
function blockToMarkdown(block) {
  const type = block.type;
  const content = block[type];

  switch (type) {
    case 'paragraph':
      return richTextToMarkdown(content.rich_text) + '\n\n';

    case 'heading_1':
      return `# ${richTextToMarkdown(content.rich_text)}\n\n`;

    case 'heading_2':
      return `## ${richTextToMarkdown(content.rich_text)}\n\n`;

    case 'heading_3':
      return `### ${richTextToMarkdown(content.rich_text)}\n\n`;

    case 'bulleted_list_item':
      return `- ${richTextToMarkdown(content.rich_text)}\n`;

    case 'numbered_list_item':
      return `1. ${richTextToMarkdown(content.rich_text)}\n`;

    case 'to_do':
      const checked = content.checked ? '[x]' : '[ ]';
      return `- ${checked} ${richTextToMarkdown(content.rich_text)}\n`;

    case 'toggle':
      return `<details>\n<summary>${richTextToMarkdown(content.rich_text)}</summary>\n\n`;

    case 'code':
      const language = content.language || '';
      const code = richTextToMarkdown(content.rich_text);
      return `\`\`\`${language}\n${code}\n\`\`\`\n\n`;

    case 'quote':
      return `> ${richTextToMarkdown(content.rich_text)}\n\n`;

    case 'callout':
      const emoji = content.icon?.emoji || '💡';
      return `> ${emoji} ${richTextToMarkdown(content.rich_text)}\n\n`;

    case 'divider':
      return '---\n\n';

    case 'image':
      const imageUrl = content.type === 'external' 
        ? content.external.url 
        : content.file.url;
      const caption = content.caption?.length > 0 
        ? richTextToMarkdown(content.caption) 
        : 'image';
      return `![${caption}](${imageUrl})\n\n`;

    case 'video':
      const videoUrl = content.type === 'external'
        ? content.external.url
        : content.file.url;
      return `[Video](${videoUrl})\n\n`;

    case 'bookmark':
      return `[${content.url}](${content.url})\n\n`;

    case 'link_preview':
      return `[${content.url}](${content.url})\n\n`;

    case 'table':
      // 테이블은 복잡하므로 기본 처리만
      return '(Table content)\n\n';

    default:
      return '';
  }
}

/**
 * Notion 블록 배열을 Markdown으로 변환
 */
function blocksToMarkdown(blocks) {
  let markdown = '';
  
  for (const block of blocks) {
    markdown += blockToMarkdown(block);
  }

  return markdown.trim();
}

module.exports = {
  richTextToMarkdown,
  blockToMarkdown,
  blocksToMarkdown
};

