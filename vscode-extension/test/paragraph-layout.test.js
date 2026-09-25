'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const test=require('node:test');
const path=require('node:path');
const marked=require(process.env.COURSE_NOTES_MARKED_PATH || 'marked');
const {parseHTML}=require(process.env.COURSE_NOTES_DOM_PATH || 'linkedom');
const helper=require(path.resolve(__dirname,'../media/html-markdown.js'));
const project=process.env.COURSE_NOTES_PROJECT_ROOT || path.resolve(__dirname,'../..');
function setup() {
 const parser=new marked.Marked();
 const window={location:{pathname:'/'},CourseNotesHtmlMarkdown:helper,CourseNotesEquationNumbering:require(path.join(project,'equation-numbering.js')),CourseNotesCodeBlocks:{renderCodeBlock:token=>`<pre><code>${token.text}</code></pre>`},marked:{Renderer:marked.Renderer,Lexer:marked.Lexer,use:(...a)=>parser.use(...a),parse:(...a)=>parser.parse(...a)}};
 const context=vm.createContext({window});
 const source=fs.readFileSync(path.join(project,'app.js'),'utf8');
 vm.runInContext(source.slice(0,source.indexOf('function sectionMarkup('))+'\nconfigureMarkdown();',context);
 return function render(input) {context.input=input;const html=vm.runInContext('renderMarkdown(input)',context);const {document}=parseHTML(`<html><body><main id="content">${html}</main></body></html>`);const root=document.getElementById('content');helper.normalizeParagraphs(root);return {html,root};};
}
function bareText(container){return Array.from(container.childNodes).filter(n=>n.nodeType===3&&n.textContent.trim());}
test('first and later paragraphs in HTML list items use identical p elements',()=>{
 const {html,root}=setup()('<ol type="a"><li>First *paragraph*.\n\nSecond paragraph.\n\nThird paragraph.</li><li>Compact item.</li></ol>');
 assert.doesNotMatch(html, /<\/li><\/p>/);
 assert.equal(root.querySelector('li').querySelectorAll(':scope > p').length,3);
 assert.equal(bareText(root.querySelector('li')).length,0);
 assert.equal(root.querySelectorAll('p:empty').length,0);
 assert.equal(root.querySelectorAll('li')[1].textContent.trim(),'Compact item.');
});
test('normal prose closing one item and opening another stays in the right item',()=>{
 const {html,root}=setup()('<ol><li>First one.\n\nSecond one.</li>\n<li>First two.\n\nSecond two.</li></ol>');
 const items=root.querySelectorAll('li');
 assert.equal(items.length,2);
 assert.deepEqual(Array.from(items[0].querySelectorAll('p')).map(n=>n.textContent.trim()),['First one.','Second one.']);
 assert.deepEqual(Array.from(items[1].querySelectorAll('p')).map(n=>n.textContent.trim()),['First two.','Second two.']);
 assert.equal(root.querySelectorAll('p:empty').length,0);
});
test('single-paragraph lists stay compact; explicit headings labels and table cells are not paragraph-wrapped',()=>{
 const render=setup();
 const {root}=render('<ol><li>*One*</li><li>Two <code>*literal*</code></li></ol>');
 assert.equal(root.querySelectorAll('p').length,0);
 const renderer=helper.createParagraphRenderer(marked);
 const html=renderer.call({parser:{parseInline:()=>'<p>Existing.</p><h1>Heading</h1><div class="label">Example</div><table><tr><td>___</td><td>___</td></tr></table>'}}, {tokens:[]});
 assert.equal(html,'<p>Existing.</p><h1>Heading</h1><div class="label">Example</div><table><tr><td>___</td><td>___</td></tr></table>');
});
test('normalization preserves existing nodes, attributes, math, tables and literal code',()=>{
 const {root}=setup()(String.raw`<div class="callout example"><div class="label">Example</div>First $A_i$ and <code>*code*</code>.<p data-source-line="10">Second.</p><table><tr><td>___</td><td>___</td><td>___</td></tr></table></div>`);
 const block=root.querySelector('.callout');
 assert.equal(block.querySelectorAll(':scope > p').length,2);
 assert.equal(block.querySelector('.label').innerHTML,'Example');
 assert.equal(block.querySelector('p').textContent,String.raw`First \(A_i\) and *code*.`);
 assert.equal(block.querySelector('p[data-source-line]').getAttribute('data-source-line'),'10');
 assert.equal(block.querySelectorAll('td').length,3);
 assert.equal(block.querySelector('code').textContent,'*code*');
 const existing=block.querySelector('p[data-source-line]');helper.normalizeParagraphs(root);assert.equal(block.querySelector('p[data-source-line]'),existing);assert.equal(block.querySelectorAll(':scope > p').length,2);
});
test('dice solution fixture has five paragraphs in b and two in c with no empty paragraphs',()=>{
 const input="<details class=\"collapsible\">\n<summary>Solution</summary>\n<div class=\"collapsible__content\">\n\nThis requires some careful thinking.\n\n<ol type=\"a\">\n  <li>$A_1$ and $A_2$ are clearly not independent. They are disjoint: if I know that $A_1$ has occurred, that means that the first die rolled an odd number, and therefore cannot have rolled an even number. $A_1$ and $A_3$ are independent: the outcome of one dice roll does not impact the outcome of another. Similarly, $A_2$ and $A_3$ are also independent, as they are events for two independently rolled dice.</li>\n  <li>$A_1$ and $A_4$ are indeed independent. We can directly and explicitly count the outcomes. Let's first calculate what the probabilities for the two events themselves are.\n\n  What is the probability that die 1 rolls an odd number? Three out of six equally probable outcomes are odd, so the probability is $1/2$. This is true for die 2 as well.\n  \n  What is the probability that the sum of the two numbers is odd? If both numbers are even or both numbers are odd, the sum is even. These two outcomes both have probability $(1/2) \\cdot (1/2) = 1/4$. Summing them gives $1/2$ again. Then we already know the probability that the sum is an odd number is $1/2$, but let's compute it anyway: if the first number is even and the second is odd, then we have that the sum is odd. Similarly, if the first number is odd and the second is even, we also have that the sum is odd. Both of these also have a probability of $(1/2) \\cdot (1/2) = 1/4$, and summing them also gives $1/2$.\n  \n  Now we calculate the conditional probability. Suppose that $A_1$ has occurred, meaning the first die rolled an odd number. What is the probability that the sum is odd? In order for $A_4$ to occur, $A_3^c$ must occur, meaning the second die needs to be even. This has probability $1/2$ of occurring. Therefore, the conditional probability $\\mathbb P(A_4 \\,|\\, A_1) = 1/2 = \\mathbb P(A_4)$.\n  \n  Similarly, one can compute that $\\mathbb P(A_1 \\,|\\, A_4) = \\mathbb P(A_1)$. We have that $\\mathbb P(A_1) = 1/2$. Knowing that the sum is odd gives us that either die 1 rolled an even number and die 2 odd, or the other way around. These two events have equal probability, so we have that $\\mathbb P(A_1 \\,|\\, A_4) = 1/2$ as well. Hence, $A_1 \\perp A_4$.</li>\n  <li>We can easily compute that $A_2 \\perp A_4$ and $A_3 \\perp A_4$ in exactly the same way as above. $A_2$ is also independent of $A_3$, as they concern the outcomes of independent dice rolls. Hence, every pair we can choose from $A_2, A_3, A_4$ is independent, and we may conclude that this collection of events is pairwise independent.\n  \n  Are they mutually independent? It turns out that they are not. Suppose we know that events $A_2$ and $A_3$ both occurred. That means that $A_4$ *must* have occurred: if we already know that die 1 was even and die 2 was odd, then the sum must be odd. Therefore, while $\\mathbb P(A_4) = 1/2$, we have that $\\mathbb P(A_4 \\,|\\, A_2, A_3) = 1$. Similarly, if we know that event $A_2$ occurred but that event $A_3$ did *not* occur, we know that the sum must be even, and $A_4$ cannot occur. Therefore, the events are not mutually independent.</li>\n</ol>\n\n</div>\n</details>";
 const {html,root}=setup()(input);
 const details=Array.from(root.querySelectorAll('details')).find(d=>d.textContent.includes('This requires some careful thinking.'));
 assert.ok(details);
 const items=details.querySelectorAll('ol > li');
 assert.equal(items.length,3);
 assert.equal(items[1].querySelectorAll(':scope > p').length,5);
 assert.equal(items[2].querySelectorAll(':scope > p').length,2);
 assert.equal(bareText(items[1]).length,0);
 assert.equal(bareText(items[2]).length,0);
 assert.equal(details.querySelectorAll('p:empty').length,0);
 assert.doesNotMatch(html, /COURSECNOTES/);
});

test('normalization leaves standalone anchors and images untouched',()=>{
 const {document}=parseHTML('<html><body><main><div class="callout"><a id="anchor"></a><div class="label">Example</div><img src="figure.png"><p>Existing.</p></div></main></body></html>');
 const root=document.querySelector('main');const anchor=root.querySelector('a');const image=root.querySelector('img');helper.normalizeParagraphs(root);
 assert.equal(anchor.parentNode,root.querySelector('.callout'));assert.equal(image.parentNode,root.querySelector('.callout'));assert.equal(root.querySelectorAll('p').length,1);
});

test('preview paragraph splitting preserves source positions and existing source nodes',()=>{
 const parser=new marked.Marked();
 const window={CourseNotesHtmlMarkdown:helper,CourseNotesEquationNumbering:require(path.join(project,'equation-numbering.js')),CourseNotesSourceNavigation:require(path.join(project,'vscode-extension/media/source-navigation.js')),CourseNotesCodeBlocks:{renderCodeBlock:token=>`<pre><code>${token.text}</code></pre>`},marked:{Renderer:marked.Renderer,Lexer:marked.Lexer,use:(...a)=>parser.use(...a),lexer:(...a)=>parser.lexer(...a),parser:(...a)=>parser.parser(...a),get defaults(){return parser.defaults;}}};
 const context=vm.createContext({window,acquireVsCodeApi:()=>({}),document:{getElementById:()=>({})}});
 const source=fs.readFileSync(path.join(project,'vscode-extension/media/preview.js'),'utf8');
 vm.runInContext(source.slice(0,source.indexOf('  function queueRender('))+'\nwindow.renderForTest=renderMarkdown;\n})();',context);
 const html=window.renderForTest('<ol type="a"><li>First.\n\nSecond.</li></ol>');
 const {document}=parseHTML(`<html><body><main>${html}</main></body></html>`);
 const root=document.querySelector('main');
 const sourceParagraph=root.querySelector('p[data-source-line="2"]');assert.ok(sourceParagraph);
 helper.normalizeParagraphs(root);
 assert.equal(root.querySelector('p[data-source-line="2"]'),sourceParagraph);
 assert.equal(root.querySelector('ol').getAttribute('data-source-line'),'0');
 assert.equal(root.querySelectorAll('li > p').length,2);
 assert.equal(root.querySelectorAll('p:empty').length,0);
});
