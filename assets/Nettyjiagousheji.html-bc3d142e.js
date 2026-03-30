import{_ as n,o as s,c as a,d as e}from"./app-4d773e5f.js";const t={},p=e(`<h2 id="netty整体架构" tabindex="-1"><a class="header-anchor" href="#netty整体架构" aria-hidden="true">#</a> Netty整体架构</h2><p>Netty采用模块化、分层设计，每一层都有明确的职责。</p><h3 id="架构分层图" tabindex="-1"><a class="header-anchor" href="#架构分层图" aria-hidden="true">#</a> 架构分层图</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────────────────────┐
│                        Netty Architecture                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Application Layer                            │   │
│  │                      (应用层)                                      │   │
│  │                                                                   │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │   │   业务逻辑    │  │   业务处理器  │  │  编码/解码   │             │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    ChannelPipeline Layer                          │   │
│  │                      (管道层)                                      │   │
│  │                                                                   │   │
│  │      HeadContext ── Handler1 ── Handler2 ── Handler3 ── TailContext│  │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Transport Layer                                │   │
│  │                      (传输层)                                      │   │
│  │                                                                   │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │   │   NIO    │  │  Epoll   │  │   OIO    │  │  Local   │        │   │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   Protocol Layer                                   │   │
│  │                      (协议层)                                      │   │
│  │                                                                   │   │
│  │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │   │
│  │   │  HTTP  │ │ WebSocket│ │ SSL/TLS │ │ Protobuf│ │  自定义  │        │   │
│  │   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="模块说明" tabindex="-1"><a class="header-anchor" href="#模块说明" aria-hidden="true">#</a> 模块说明</h3><table><thead><tr><th>模块</th><th>作用</th></tr></thead><tbody><tr><td>Application</td><td>业务逻辑层，处理具体业务</td></tr><tr><td>ChannelPipeline</td><td>Handler容器，管理Handler链</td></tr><tr><td>Transport</td><td>网络传输，NIO/Epoll/OIO</td></tr><tr><td>Protocol</td><td>协议支持，编解码</td></tr></tbody></table><h2 id="线程模型详解" tabindex="-1"><a class="header-anchor" href="#线程模型详解" aria-hidden="true">#</a> 线程模型详解</h2><p>Netty的线程模型是其高性能的核心，理解它对于用好Netty至关重要。</p><h3 id="reactor模式概述" tabindex="-1"><a class="header-anchor" href="#reactor模式概述" aria-hidden="true">#</a> Reactor模式概述</h3><p>Reactor模式是一种事件驱动模式，核心思想：</p><ol><li>单线程或多线程监听IO事件</li><li>事件发生时分发给对应的Handler处理</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>传统阻塞模式:                         Reactor模式:

客户端 ──&gt; 线程 ──&gt; 阻塞等待IO          客户端 ──&gt; Selector ──&gt; 分发 ──&gt; Handler
                                          ↑
线程1 ──&gt; IO操作                        线程1 ──&gt; 处理IO就绪
线程2 ──&gt; IO操作          ──&gt;            线程2 ──&gt; 处理其他IO就绪
线程N ──&gt; IO操作                        线程N ──&gt; 处理其他IO就绪
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="netty线程模型" tabindex="-1"><a class="header-anchor" href="#netty线程模型" aria-hidden="true">#</a> Netty线程模型</h3><h4 id="_1-单线程模型" tabindex="-1"><a class="header-anchor" href="#_1-单线程模型" aria-hidden="true">#</a> 1. 单线程模型</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 单线程模型：Boss和Worker使用同一个线程组</span>
<span class="token class-name">EventLoopGroup</span> group <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NioEventLoopGroup</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">ServerBootstrap</span> bootstrap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ServerBootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
bootstrap<span class="token punctuation">.</span><span class="token function">group</span><span class="token punctuation">(</span>group<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// 同一个线程组</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────┐
│              单 EventLoopGroup                      │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │            EventLoop (单线程)                  │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │              Selector                    │  │ │
│  │  │   监控所有Channel的accept/read/write   │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────┘ │
│                       │                              │
│         ┌─────────────┼─────────────┐               │
│         │             │             │               │
│         ▼             ▼             ▼               │
│    Channel1      Channel2      Channel3            │
│    (accept)       (read)        (write)             │
└─────────────────────────────────────────────────────┘

适用场景：连接数少、业务处理快的测试环境
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-多线程模型" tabindex="-1"><a class="header-anchor" href="#_2-多线程模型" aria-hidden="true">#</a> 2. 多线程模型</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 多线程模型：Boss 1个线程，Worker多个线程</span>
<span class="token class-name">EventLoopGroup</span> bossGroup <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NioEventLoopGroup</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">EventLoopGroup</span> workerGroup <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">NioEventLoopGroup</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">ServerBootstrap</span> bootstrap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ServerBootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
bootstrap<span class="token punctuation">.</span><span class="token function">group</span><span class="token punctuation">(</span>bossGroup<span class="token punctuation">,</span> workerGroup<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌────────────────────────────────────────────────────────┐
│              双 EventLoopGroup                         │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Boss EventLoop (1个线程)                │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │           Selector                         │  │  │
│  │  │        只处理accept事件                    │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                               │
│                    accept连接                           │
│                         │                               │
├─────────────────────────┼───────────────────────────────┤
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Worker EventLoopGroup (多个线程)           │  │
│  │                                                  │  │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐      │  │
│  │   │ EventLoop│  │ EventLoop│  │ EventLoop│      │  │
│  │   │ Thread-1 │  │ Thread-2 │  │ Thread-3 │      │  │
│  │   └────┬─────┘  └────┬─────┘  └────┬─────┘      │  │
│  │        │            │            │              │  │
│  │        ▼            ▼            ▼              │  │
│  │    Channel1    Channel2    Channel3             │  │
│  │    (read/write)(read/write)(read/write)        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘

适用场景：大多数生产环境
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-主从多线程模型-netty推荐" tabindex="-1"><a class="header-anchor" href="#_3-主从多线程模型-netty推荐" aria-hidden="true">#</a> 3. 主从多线程模型（Netty推荐）</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────────┐
│                    主从 Reactor 模型                         │
│                                                              │
│  ┌────────────────┐                                         │
│  │   Boss Group   │  (Main Reactor)                         │
│  │  ┌──────────┐  │  处理accept                             │
│  │  │  Boss 1  │  │  监听ServerSocket                       │
│  │  └──────────┘  │                                         │
│  └───────┬────────┘                                         │
│          │                                                  │
│          │ accept                                           │
│          ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  注册到Worker                          │   │
│  └──────────────────────────────────────────────────────┘   │
│          │                                                  │
│          ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Worker Group (从 Reactor)              │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │  Worker  │  │  Worker  │  │  Worker  │             │   │
│  │  │    1     │  │    2     │  │    N     │             │   │
│  │  │ (线程1)  │  │ (线程2)  │  │ (线程N)  │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  │                                                       │   │
│  │  每个Worker处理多个Channel的读写事件                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="线程分配策略" tabindex="-1"><a class="header-anchor" href="#线程分配策略" aria-hidden="true">#</a> 线程分配策略</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Netty使用EventLoop绑定Channel</span>
<span class="token comment">// 同一个Channel的所有操作都在同一个EventLoop中执行</span>

<span class="token comment">// 查看源码：NioEventLoop.java</span>
<span class="token comment">// Channel注册到Selector</span>
<span class="token class-name">ServerSocketChannel</span><span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>selector<span class="token punctuation">,</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_ACCEPT</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 每个EventLoop维护一个Selector</span>
<span class="token comment">// 使用Hash算法将Channel分配到不同的EventLoop</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="零拷贝技术" tabindex="-1"><a class="header-anchor" href="#零拷贝技术" aria-hidden="true">#</a> 零拷贝技术</h2><p>零拷贝是Netty高性能的关键技术之一。</p><h3 id="传统io数据流向" tabindex="-1"><a class="header-anchor" href="#传统io数据流向" aria-hidden="true">#</a> 传统IO数据流向</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────────┐
│                    传统IO数据流                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   磁盘文件                                                   │
│      │                                                      │
│      ▼                                                      │
│   ┌─────────────────────────────────────────────┐           │
│   │            内核缓冲区 (Kernel Buffer)        │           │
│   │               (Page Cache)                   │           │
│   └──────────────────────┬──────────────────────┘           │
│                          │ DMA拷贝                          │
│                          ▼                                  │
│   ┌─────────────────────────────────────────────┐           │
│   │            用户空间 (User Space)            │           │
│   │  ┌───────────────────────────────────────┐ │           │
│   │  │         JVM堆内存 (Heap)              │ │           │
│   │  │            ByteBuffer                 │ │           │
│   │  └───────────────────┬───────────────────┘ │           │
│   │                      │                    │           │
│   │                      │ CPU拷贝            │           │
│   │                      ▼                    │           │
│   │  ┌───────────────────────────────────────┐│           │
│   │  │        Socket Buffer (堆外内存)       ││           │
│   │  └───────────────────┬───────────────────┘│           │
│   └──────────────────────┬────────────────────┘           │
│                          │ DMA拷贝                        │
│                          ▼                                │
│   ┌─────────────────────────────────────────────┐         │
│   │               网卡 (NIC)                    │         │
│   └─────────────────────────────────────────────┘         │
│                                                              │
│  拷贝次数：4次 (2次DMA + 2次CPU)                            │
└─────────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="netty零拷贝实现" tabindex="-1"><a class="header-anchor" href="#netty零拷贝实现" aria-hidden="true">#</a> Netty零拷贝实现</h3><h4 id="_1-directbytebuffer-直接内存" tabindex="-1"><a class="header-anchor" href="#_1-directbytebuffer-直接内存" aria-hidden="true">#</a> 1. DirectByteBuffer（直接内存）</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 传统Heap ByteBuffer: JVM堆内存</span>
<span class="token class-name">ByteBuffer</span> heapBuffer <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">allocate</span><span class="token punctuation">(</span><span class="token number">1024</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 数据需要从堆内存拷贝到直接内存，再发送到网卡</span>

<span class="token comment">// Netty DirectByteBuffer: 直接内存，绕过JVM</span>
<span class="token class-name">ByteBuf</span> directBuf <span class="token operator">=</span> <span class="token class-name">Unpooled</span><span class="token punctuation">.</span><span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token number">1024</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 直接在内核和直接内存之间传输，减少一次拷贝</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_2-compositebytebuf-组合缓冲区" tabindex="-1"><a class="header-anchor" href="#_2-compositebytebuf-组合缓冲区" aria-hidden="true">#</a> 2. CompositeByteBuf（组合缓冲区）</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 场景：HTTP请求 = 请求头 + 请求体</span>

<span class="token comment">// 传统方式：合并两个Buffer</span>
<span class="token class-name">ByteBuffer</span> header <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">allocate</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">ByteBuffer</span> body <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">allocate</span><span class="token punctuation">(</span><span class="token number">1000</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">ByteBuffer</span> combined <span class="token operator">=</span> <span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">allocate</span><span class="token punctuation">(</span>header<span class="token punctuation">.</span><span class="token function">remaining</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> body<span class="token punctuation">.</span><span class="token function">remaining</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
combined<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>header<span class="token punctuation">)</span><span class="token punctuation">;</span>
combined<span class="token punctuation">.</span><span class="token function">put</span><span class="token punctuation">(</span>body<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Netty方式：CompositeByteBuf，不需要真正拷贝</span>
<span class="token class-name">CompositeByteBuf</span> composite <span class="token operator">=</span> <span class="token class-name">Unpooled</span><span class="token punctuation">.</span><span class="token function">compositeBuffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
composite<span class="token punctuation">.</span><span class="token function">addComponents</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">,</span> headerBuf<span class="token punctuation">,</span> bodyBuf<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 只是逻辑上的组合，实际数据还在原来的Buffer中</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_3-fileregion-文件传输" tabindex="-1"><a class="header-anchor" href="#_3-fileregion-文件传输" aria-hidden="true">#</a> 3. FileRegion（文件传输）</h4><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 传统文件传输</span>
<span class="token class-name">FileInputStream</span> fis <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">FileInputStream</span><span class="token punctuation">(</span><span class="token string">&quot;file.txt&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">byte</span><span class="token punctuation">[</span><span class="token punctuation">]</span> data <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token keyword">byte</span><span class="token punctuation">[</span>fis<span class="token punctuation">.</span><span class="token function">available</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
fis<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">;</span>
socketChannel<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span><span class="token class-name">ByteBuffer</span><span class="token punctuation">.</span><span class="token function">wrap</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 需要将文件内容读取到内存</span>

<span class="token comment">// Netty FileRegion 零拷贝</span>
<span class="token class-name">FileChannel</span> fileChannel <span class="token operator">=</span> fis<span class="token punctuation">.</span><span class="token function">getChannel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
ctx<span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">DefaultFileRegion</span><span class="token punctuation">(</span>fileChannel<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> fileChannel<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 直接使用DMA将文件内容传输到网卡</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_4-零拷贝示意图" tabindex="-1"><a class="header-anchor" href="#_4-零拷贝示意图" aria-hidden="true">#</a> 4. 零拷贝示意图</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────────┐
│                    Netty零拷贝                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   磁盘文件                                                   │
│      │                                                      │
│      ▼                                                      │
│   ┌─────────────────────────────────────────────┐           │
│   │            内核缓冲区 (Kernel Buffer)        │           │
│   └──────────────────────┬──────────────────────┘           │
│                          │ DMA拷贝                         │
│                          ▼                                  │
│   ┌─────────────────────────────────────────────┐           │
│   │         Netty DirectByteBuffer               │           │
│   │            (直接内存)                         │           │
│   │    无需拷贝到JVM堆内存                        │           │
│   └──────────────────────┬──────────────────────┘           │
│                          │ DMA拷贝                         │
│                          ▼                                  │
│   ┌─────────────────────────────────────────────┐          │
│   │               网卡 (NIC)                    │          │
│   └─────────────────────────────────────────────┘          │
│                                                              │
│  拷贝次数：2次 (仅DMA)                                       │
└─────────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="内存池原理" tabindex="-1"><a class="header-anchor" href="#内存池原理" aria-hidden="true">#</a> 内存池原理</h2><p>频繁的内存分配和回收会导致频繁的GC，Netty通过内存池解决这个问题。</p><h3 id="问题分析" tabindex="-1"><a class="header-anchor" href="#问题分析" aria-hidden="true">#</a> 问题分析</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 不使用内存池：每次读写都创建新对象</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WithoutPool</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">handle</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">ByteBuf</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ByteBuf</span> response <span class="token operator">=</span> <span class="token class-name">Unpooled</span><span class="token punctuation">.</span><span class="token function">buffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// 每次分配新内存</span>
        response<span class="token punctuation">.</span><span class="token function">writeBytes</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
        ctx<span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>response<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// response需要GC回收，频繁GC影响性能</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 使用内存池：复用内存</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">WithPool</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ByteBufAllocator</span> allocator <span class="token operator">=</span> <span class="token class-name">PooledByteBufAllocator</span><span class="token punctuation">.</span><span class="token constant">DEFAULT</span><span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">handle</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">ByteBuf</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ByteBuf</span> response <span class="token operator">=</span> allocator<span class="token punctuation">.</span><span class="token function">buffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// 从池中获取</span>
        response<span class="token punctuation">.</span><span class="token function">writeBytes</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
        ctx<span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>response<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// 使用完后归还到池中，供下次使用</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="内存池架构" tabindex="-1"><a class="header-anchor" href="#内存池架构" aria-hidden="true">#</a> 内存池架构</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────────┐
│                    Netty内存池架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  PoolArena                            │   │
│  │                   (内存池管理)                         │   │
│  │                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐          │   │
│  │  │  HeapArena       │  │  DirectArena     │          │   │
│  │  │  (堆内存池)       │  │  (直接内存池)    │          │   │
│  │  └─────────────────┘  └─────────────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│         ┌────────────────┼────────────────┐                │
│         ▼                ▼                ▼                │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐        │
│  │  PoolChunk │    │  PoolChunk │    │  PoolChunk │        │
│  │  (16MB)    │    │  (16MB)    │    │  (16MB)    │        │
│  │            │    │            │    │            │        │
│  │  用于分配  │    │  用于分配  │    │  用于分配  │        │
│  │  大块内存  │    │  大块内存  │    │  大块内存  │        │
│  └────────────┘    └────────────┘    └────────────┘        │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               PoolSubpage (4KB-16KB)                 │   │
│  │   用于分配小于16KB的内存                              │   │
│  │   通过位图管理已分配和空闲的内存                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="内存分配流程" tabindex="-1"><a class="header-anchor" href="#内存分配流程" aria-hidden="true">#</a> 内存分配流程</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// PooledByteBufAllocator.java</span>
<span class="token keyword">public</span> <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 1. 判断使用堆内存还是直接内存</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>directByDefault<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span>initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token function">heapBuffer</span><span class="token punctuation">(</span>initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">public</span> <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 2. 从线程本地缓存获取</span>
    <span class="token class-name">PoolThreadCache</span> cache <span class="token operator">=</span> threadCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">PooledByteBuf</span> buf <span class="token operator">=</span> cache<span class="token punctuation">.</span>directCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>buf <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        buf<span class="token punctuation">.</span><span class="token function">reuse</span><span class="token punctuation">(</span>initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> buf<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 3. 从Arena获取</span>
    <span class="token keyword">return</span> <span class="token function">newDirect0</span><span class="token punctuation">(</span>cache<span class="token punctuation">,</span> initialCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="高性能设计原则" tabindex="-1"><a class="header-anchor" href="#高性能设计原则" aria-hidden="true">#</a> 高性能设计原则</h2><h3 id="_1-无锁化设计" tabindex="-1"><a class="header-anchor" href="#_1-无锁化设计" aria-hidden="true">#</a> 1. 无锁化设计</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 每个Channel只在一个EventLoop中处理</span>
<span class="token comment">// 无需加锁，保证线程安全</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ChannelHandler</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 在EventLoop单线程中执行，无需加锁</span>
        <span class="token comment">// 消息处理...</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 使用无锁队列</span>
<span class="token comment">// 任务队列使用MpscLinkedQueue（多生产者单消费者）</span>
<span class="token comment">// 保证高并发下的高性能</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-串行化处理" tabindex="-1"><a class="header-anchor" href="#_2-串行化处理" aria-hidden="true">#</a> 2. 串行化处理</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 在Pipeline中按顺序处理，避免加锁</span>
<span class="token comment">// 同一个Channel的所有事件都在同一个线程处理</span>

<span class="token class-name">ChannelPipeline</span> pipeline <span class="token operator">=</span> ch<span class="token punctuation">.</span><span class="token function">pipeline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 按顺序执行，无需同步</span>
pipeline
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Decoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>      <span class="token comment">// 1. 解码</span>
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Encoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>      <span class="token comment">// 2. 编码</span>
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">BusinessHandler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// 3. 业务处理</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-延迟释放策略" tabindex="-1"><a class="header-anchor" href="#_3-延迟释放策略" aria-hidden="true">#</a> 3. 延迟释放策略</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 手动管理引用计数，避免频繁释放和申请</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BusinessHandler</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 方案1：手动保留，在另一个Handler使用后释放</span>
        <span class="token class-name">ReferenceCountUtil</span><span class="token punctuation">.</span><span class="token function">retain</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 方案2：延迟释放</span>
        ctx<span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>response<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addListener</span><span class="token punctuation">(</span><span class="token class-name">ChannelFutureListener</span><span class="token punctuation">.</span><span class="token constant">CLOSE_ON_FAILURE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 方案3：使用SimpleChannelInboundHandler自动释放</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// SimpleChannelInboundHandler会自动释放msg</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">AutoReleaseHandler</span> <span class="token keyword">extends</span> <span class="token class-name">SimpleChannelInboundHandler</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">String</span><span class="token punctuation">&gt;</span></span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">protected</span> <span class="token keyword">void</span> <span class="token function">channelRead0</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">String</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// msg会在方法结束后自动释放</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-预分配机制" tabindex="-1"><a class="header-anchor" href="#_4-预分配机制" aria-hidden="true">#</a> 4. 预分配机制</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 预分配ByteBuf，避免每次操作都创建新对象</span>
<span class="token comment">// 在Handler初始化时分配</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">MyHandler</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token class-name">ByteBuf</span> buf<span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">handlerAdded</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 初始化时预分配</span>
        buf <span class="token operator">=</span> ctx<span class="token punctuation">.</span><span class="token function">alloc</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">buffer</span><span class="token punctuation">(</span><span class="token number">256</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 使用预分配的Buffer</span>
        <span class="token comment">// 处理完成后重置，不释放</span>
        buf<span class="token punctuation">.</span><span class="token function">clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">handlerRemoved</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 移除时释放</span>
        buf<span class="token punctuation">.</span><span class="token function">release</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        buf <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="线程安全最佳实践" tabindex="-1"><a class="header-anchor" href="#线程安全最佳实践" aria-hidden="true">#</a> 线程安全最佳实践</h2><h3 id="_1-channelhandler中的线程安全" tabindex="-1"><a class="header-anchor" href="#_1-channelhandler中的线程安全" aria-hidden="true">#</a> 1. ChannelHandler中的线程安全</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 错误示例：共享可变状态</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">UnsafeHandler</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> count <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>  <span class="token comment">// 共享状态，多线程不安全</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        count<span class="token operator">++</span><span class="token punctuation">;</span>  <span class="token comment">// 危险！</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 正确示例1：使用AtomicInteger</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SafeHandler1</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">AtomicInteger</span> count <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">AtomicInteger</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        count<span class="token punctuation">.</span><span class="token function">incrementAndGet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// 线程安全</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 正确示例2：使用ThreadLocal</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">SafeHandler2</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ThreadLocal</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Integer</span><span class="token punctuation">&gt;</span></span> count <span class="token operator">=</span> <span class="token class-name">ThreadLocal</span><span class="token punctuation">.</span><span class="token function">withInitial</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> value <span class="token operator">=</span> count<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        count<span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>value <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-在业务线程中处理" tabindex="-1"><a class="header-anchor" href="#_2-在业务线程中处理" aria-hidden="true">#</a> 2. 在业务线程中处理</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 将耗时操作放到业务线程池</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">BusinessThreadHandler</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>

    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">ExecutorService</span> businessExecutor <span class="token operator">=</span>
        <span class="token class-name">Executors</span><span class="token punctuation">.</span><span class="token function">newFixedThreadPool</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 耗时业务提交到线程池</span>
        businessExecutor<span class="token punctuation">.</span><span class="token function">submit</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>
            <span class="token comment">// 业务处理</span>
            <span class="token class-name">String</span> result <span class="token operator">=</span> <span class="token function">process</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span> msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token comment">// 结果写回Channel</span>
            ctx<span class="token punctuation">.</span><span class="token function">writeAndFlush</span><span class="token punctuation">(</span>result<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">private</span> <span class="token class-name">String</span> <span class="token function">process</span><span class="token punctuation">(</span><span class="token class-name">String</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 模拟耗时处理</span>
        <span class="token keyword">return</span> <span class="token string">&quot;processed: &quot;</span> <span class="token operator">+</span> msg<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="传输层实现" tabindex="-1"><a class="header-anchor" href="#传输层实现" aria-hidden="true">#</a> 传输层实现</h2><h3 id="支持的传输类型" tabindex="-1"><a class="header-anchor" href="#支持的传输类型" aria-hidden="true">#</a> 支持的传输类型</h3><table><thead><tr><th>类型</th><th>说明</th><th>平台</th><th>特点</th></tr></thead><tbody><tr><td>NIO</td><td>非阻塞IO</td><td>所有</td><td>通用，高性能</td></tr><tr><td>Epoll</td><td>Linux原生</td><td>Linux</td><td>最高性能，边缘触发</td></tr><tr><td>OIO</td><td>阻塞IO</td><td>所有</td><td>兼容旧代码</td></tr><tr><td>Local</td><td>本地传输</td><td>所有</td><td>同一JVM内通信</td></tr><tr><td>Embedded</td><td>嵌入测试</td><td>所有</td><td>用于单元测试</td></tr></tbody></table><h3 id="选择建议" tabindex="-1"><a class="header-anchor" href="#选择建议" aria-hidden="true">#</a> 选择建议</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Linux服务器：使用Epoll（需要netty-transport-native-epoll）</span>
<span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">setProperty</span><span class="token punctuation">(</span><span class="token string">&quot;io.netty.transport.epoll.enabled&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;true&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">ServerBootstrap</span> bootstrap <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">ServerBootstrap</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
bootstrap<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token class-name">EpollServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Windows/Mac开发环境：使用NIO</span>
bootstrap<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token class-name">NioServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 兼容老代码：使用OIO</span>
bootstrap<span class="token punctuation">.</span><span class="token function">channel</span><span class="token punctuation">(</span><span class="token class-name">OioServerSocketChannel</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 测试环境：使用Embedded</span>
<span class="token class-name">EmbeddedChannel</span> channel <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">EmbeddedChannel</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyHandler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="架构分层解读" tabindex="-1"><a class="header-anchor" href="#架构分层解读" aria-hidden="true">#</a> 架构分层解读</h2><h3 id="_1-传输层-transport" tabindex="-1"><a class="header-anchor" href="#_1-传输层-transport" aria-hidden="true">#</a> 1. 传输层（Transport）</h3><p>负责实际的网络读写操作：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// NioServerSocketChannel.java - NIO服务端通道</span>
<span class="token comment">// NioSocketChannel.java - NIO客户端通道</span>
<span class="token comment">// EpollServerSocketChannel.java - Epoll服务端通道</span>

<span class="token comment">// 核心方法</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Channel</span> <span class="token punctuation">{</span>
    <span class="token comment">// 绑定地址</span>
    <span class="token class-name">ChannelFuture</span> <span class="token function">bind</span><span class="token punctuation">(</span><span class="token class-name">SocketAddress</span> localAddress<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 连接</span>
    <span class="token class-name">ChannelFuture</span> <span class="token function">connect</span><span class="token punctuation">(</span><span class="token class-name">SocketAddress</span> remoteAddress<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 读写</span>
    <span class="token class-name">ChannelFuture</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token class-name">Object</span> msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 读取</span>
    <span class="token class-name">Channel</span> <span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 刷新</span>
    <span class="token class-name">Channel</span> <span class="token function">flush</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 关闭</span>
    <span class="token class-name">ChannelFuture</span> <span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-协议层-protocol" tabindex="-1"><a class="header-anchor" href="#_2-协议层-protocol" aria-hidden="true">#</a> 2. 协议层（Protocol）</h3><p>支持多种协议编解码：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// HTTP</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">HttpServerCodec</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">HttpObjectAggregator</span><span class="token punctuation">(</span><span class="token number">8192</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// WebSocket</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">WebSocketServerProtocolHandler</span><span class="token punctuation">(</span><span class="token string">&quot;/ws&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">TextWebSocketFrameHandler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 自定义协议</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyDecoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MyEncoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-应用层-application" tabindex="-1"><a class="header-anchor" href="#_3-应用层-application" aria-hidden="true">#</a> 3. 应用层（Application）</h3><p>业务处理的ChannelHandler：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// 粘包拆包处理</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">LineBasedFrameDecoder</span><span class="token punctuation">(</span><span class="token number">1024</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">StringDecoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 编码解码</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ObjectEncoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ObjectDecoder</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 业务逻辑</span>
pipeline<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">BusinessHandler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>Netty通过以下设计实现高性能：</p><ol><li><p><strong>Reactor线程模型</strong> - 高效处理并发连接</p><ul><li>主从Reactor分工</li><li>EventLoop与Channel绑定</li></ul></li><li><p><strong>零拷贝</strong> - 减少数据复制</p><ul><li>DirectByteBuffer</li><li>CompositeByteBuf</li><li>FileRegion</li></ul></li><li><p><strong>内存池</strong> - 减少GC压力</p><ul><li>PooledByteBuf</li><li>线程本地缓存</li><li>高效分配算法</li></ul></li><li><p><strong>无锁化设计</strong> - 避免锁竞争</p><ul><li>单线程处理Channel</li><li>MPSC队列</li></ul></li></ol><p>理解这些架构设计对于用好Netty至关重要。</p>`,77),i=[p];function c(l,o){return s(),a("div",null,i)}const d=n(t,[["render",c],["__file","Nettyjiagousheji.html.vue"]]);export{d as default};
