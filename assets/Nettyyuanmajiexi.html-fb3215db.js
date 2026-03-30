import{_ as n,o as s,c as a,d as e}from"./app-4d773e5f.js";const t={},p=e(`<h2 id="源码目录结构" tabindex="-1"><a class="header-anchor" href="#源码目录结构" aria-hidden="true">#</a> 源码目录结构</h2><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>netty
├── common          // 通用工具类：DateUtil、StringUtil、ThreadLocal
├── buffer          // ByteBuf实现：PooledByteBuf、DirectByteBuf
├── transport       // 网络传输层：NioEventLoop、Channel
├── codec           // 编解码框架：Decoder、Encoder
├── handler         // 处理器：SSL、压缩、限流
└── resolver        // 域名解析：DnsResolver
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="nioeventloop源码解析" tabindex="-1"><a class="header-anchor" href="#nioeventloop源码解析" aria-hidden="true">#</a> NioEventLoop源码解析</h2><p>NioEventLoop是Netty最核心的类之一，负责处理IO事件和执行任务。</p><h3 id="类继承结构" tabindex="-1"><a class="header-anchor" href="#类继承结构" aria-hidden="true">#</a> 类继承结构</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// NioEventLoop.java</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">NioEventLoop</span> <span class="token keyword">extends</span> <span class="token class-name">SingleThreadEventLoop</span> <span class="token punctuation">{</span>

    <span class="token comment">// NIO相关</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">SelectorProvider</span> provider<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Selector</span> selector<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">SelectStrategy</span> selectStrategy<span class="token punctuation">;</span>

    <span class="token comment">// 选择器是否已打开</span>
    <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token keyword">int</span> selectorOpen <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="核心循环run-方法" tabindex="-1"><a class="header-anchor" href="#核心循环run-方法" aria-hidden="true">#</a> 核心循环run()方法</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// NioEventLoop.java - 核心方法</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">protected</span> <span class="token keyword">void</span> <span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">try</span> <span class="token punctuation">{</span>
            <span class="token keyword">try</span> <span class="token punctuation">{</span>
                <span class="token comment">// 计算使用哪种策略</span>
                <span class="token keyword">switch</span> <span class="token punctuation">(</span>selectStrategy<span class="token punctuation">.</span><span class="token function">calculateStrategy</span><span class="token punctuation">(</span>
                    selectNowSupplier<span class="token punctuation">,</span> <span class="token keyword">super</span><span class="token operator">::</span><span class="token function">select</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token keyword">case</span> <span class="token class-name">SelectStrategy</span><span class="token punctuation">.</span><span class="token constant">CONTINUE</span><span class="token operator">:</span>
                        <span class="token keyword">continue</span><span class="token punctuation">;</span>
                    <span class="token keyword">case</span> <span class="token class-name">SelectStrategy</span><span class="token punctuation">.</span><span class="token constant">SELECT</span><span class="token operator">:</span>
                        <span class="token comment">// 阻塞等待事件</span>
                        <span class="token function">select</span><span class="token punctuation">(</span>wakenUp<span class="token punctuation">.</span><span class="token function">getAndSet</span><span class="token punctuation">(</span><span class="token boolean">false</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token comment">// 如果被唤醒，重新检查</span>
                        <span class="token keyword">if</span> <span class="token punctuation">(</span>wakenUp<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                            selector<span class="token punctuation">.</span><span class="token function">wakeup</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                        <span class="token punctuation">}</span>
                    <span class="token keyword">default</span><span class="token operator">:</span>
                        <span class="token comment">// 继续执行</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">IOException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 处理IO异常</span>
                <span class="token function">rebuildSelector</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token function">handleLoopException</span><span class="token punctuation">(</span>e<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">continue</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            cancelledKeys <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            needsToSelectAgain <span class="token operator">=</span> <span class="token boolean">false</span><span class="token punctuation">;</span>

            <span class="token comment">// 处理IO事件和任务</span>
            <span class="token keyword">final</span> <span class="token keyword">int</span> ioRatio <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>ioRatio<span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>ioRatio <span class="token operator">==</span> <span class="token number">100</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token function">processSelectedKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                    <span class="token function">runAllTasks</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
                <span class="token keyword">final</span> <span class="token keyword">long</span> ioStartTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token keyword">try</span> <span class="token punctuation">{</span>
                    <span class="token function">processSelectedKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
                    <span class="token keyword">final</span> <span class="token keyword">long</span> ioTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-</span> ioStartTime<span class="token punctuation">;</span>
                    <span class="token comment">// 按比例执行任务</span>
                    <span class="token function">runAllTasks</span><span class="token punctuation">(</span>ioTime <span class="token operator">*</span> <span class="token punctuation">(</span><span class="token number">100</span> <span class="token operator">-</span> ioRatio<span class="token punctuation">)</span> <span class="token operator">/</span> ioRatio<span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Throwable</span> t<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">handleLoopException</span><span class="token punctuation">(</span>t<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="select方法详解" tabindex="-1"><a class="header-anchor" href="#select方法详解" aria-hidden="true">#</a> select方法详解</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// NioEventLoop.java - select方法</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">select</span><span class="token punctuation">(</span><span class="token keyword">boolean</span> oldWakenUp<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">IOException</span> <span class="token punctuation">{</span>
    <span class="token class-name">Selector</span> selector <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>selector<span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> selectCnt <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token keyword">long</span> currentTimeNanos <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// 计算超时时间（默认800ms）</span>
        <span class="token keyword">long</span> selectDeadTimeNanos <span class="token operator">=</span> currentTimeNanos <span class="token operator">+</span> <span class="token number">800000000L</span><span class="token punctuation">;</span>
        <span class="token keyword">long</span> selectTime <span class="token operator">=</span> selectDeadTimeNanos <span class="token operator">-</span> currentTimeNanos<span class="token punctuation">;</span>

        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token keyword">long</span> timeout <span class="token operator">=</span> selectTime <span class="token operator">-</span> <span class="token punctuation">(</span>currentTimeNanos <span class="token operator">-</span> currentTimeNanos<span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>timeout <span class="token operator">&lt;=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 超时了</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span>selectCnt <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    <span class="token comment">// 首次超时，调用selectNow</span>
                    selector<span class="token punctuation">.</span><span class="token function">selectNow</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                    selectCnt <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">// 阻塞等待</span>
            <span class="token keyword">int</span> selectedKeys <span class="token operator">=</span> selector<span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span>timeout<span class="token punctuation">)</span><span class="token punctuation">;</span>
            selectCnt<span class="token operator">++</span><span class="token punctuation">;</span>

            <span class="token comment">// 有事件或被唤醒</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>selectedKeys <span class="token operator">!=</span> <span class="token number">0</span> <span class="token operator">||</span> oldWakenUp <span class="token operator">||</span> wakenUp<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
                <span class="token operator">||</span> <span class="token function">hasTasks</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token function">hasScheduledTasks</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">break</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>

            <span class="token comment">// 防止空轮询</span>
            <span class="token keyword">long</span> newTime <span class="token operator">=</span> <span class="token class-name">System</span><span class="token punctuation">.</span><span class="token function">nanoTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">if</span> <span class="token punctuation">(</span>newTime <span class="token operator">-</span> currentTimeNanos <span class="token operator">&gt;=</span> selectTime<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                selectCnt <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token constant">SELECT_AUTO_CANCEL_FALSE</span> <span class="token operator">==</span> <span class="token boolean">false</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token comment">// 取消所有key</span>
                needToSelectAgain <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
            currentTimeNanos <span class="token operator">=</span> newTime<span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">CancelledKeyException</span> e<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 忽略</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="processselectedkeys处理io事件" tabindex="-1"><a class="header-anchor" href="#processselectedkeys处理io事件" aria-hidden="true">#</a> processSelectedKeys处理IO事件</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// NioEventLoop.java</span>
<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">processSelectedKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>selectedKeys <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 使用优化过的selectedKeys</span>
        <span class="token function">processSelectedKeysOptimized</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        <span class="token comment">// 使用普通的selectedKeys</span>
        <span class="token function">processSelectedKeysPlain</span><span class="token punctuation">(</span>selector<span class="token punctuation">.</span><span class="token function">selectedKeys</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">processSelectedKeysOptimized</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token keyword">int</span> i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> setSize<span class="token punctuation">;</span> <span class="token operator">++</span>i<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">final</span> <span class="token class-name">SelectionKey</span> k <span class="token operator">=</span> selectedKeys<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">;</span>
        selectedKeys<span class="token punctuation">[</span>i<span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

        <span class="token keyword">final</span> <span class="token class-name">Object</span> a <span class="token operator">=</span> k<span class="token punctuation">.</span><span class="token function">attachment</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>a <span class="token keyword">instanceof</span> <span class="token class-name">AbstractNioChannel</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token function">processSelectedKey</span><span class="token punctuation">(</span>k<span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token class-name">AbstractNioChannel</span><span class="token punctuation">)</span> a<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token class-name">NioTask</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SelectionKey</span><span class="token punctuation">&gt;</span></span> task <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">NioTask</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SelectionKey</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">)</span> a<span class="token punctuation">;</span>
            <span class="token function">processSelectedKey</span><span class="token punctuation">(</span>k<span class="token punctuation">,</span> task<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span>needsToSelectAgain<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            selectedKeys<span class="token punctuation">.</span><span class="token function">reset</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            i <span class="token operator">=</span> <span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">processSelectedKey</span><span class="token punctuation">(</span><span class="token class-name">SelectionKey</span> k<span class="token punctuation">,</span> <span class="token class-name">AbstractNioChannel</span> ch<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 获取Channel的Unsafe</span>
    <span class="token keyword">final</span> <span class="token class-name">AbstractNioChannel<span class="token punctuation">.</span>NioUnsafe</span> unsafe <span class="token operator">=</span> ch<span class="token punctuation">.</span><span class="token function">unsafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 处理不同的事件</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token keyword">int</span> readyOps <span class="token operator">=</span> k<span class="token punctuation">.</span><span class="token function">readyOps</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>readyOps <span class="token operator">&amp;</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_CONNECT</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 连接完成</span>
            <span class="token keyword">int</span> ops <span class="token operator">=</span> k<span class="token punctuation">.</span><span class="token function">interestOps</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            ops <span class="token operator">&amp;=</span> <span class="token operator">~</span><span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_CONNECT</span><span class="token punctuation">;</span>
            k<span class="token punctuation">.</span><span class="token function">interestOps</span><span class="token punctuation">(</span>ops<span class="token punctuation">)</span><span class="token punctuation">;</span>
            unsafe<span class="token punctuation">.</span><span class="token function">finishConnect</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>readyOps <span class="token operator">&amp;</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_WRITE</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 可写</span>
            ch<span class="token punctuation">.</span><span class="token function">unsafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">forceFlush</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>readyOps <span class="token operator">&amp;</span> <span class="token punctuation">(</span><span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_READ</span> <span class="token operator">|</span> <span class="token class-name">SelectionKey</span><span class="token punctuation">.</span><span class="token constant">OP_ACCEPT</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">!=</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 可读或可接受</span>
            unsafe<span class="token punctuation">.</span><span class="token function">read</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">CancelledKeyException</span> ignored<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        unsafe<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token function">voidPromise</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="bytebuf源码解析" tabindex="-1"><a class="header-anchor" href="#bytebuf源码解析" aria-hidden="true">#</a> ByteBuf源码解析</h2><h3 id="bytebuf类层次" tabindex="-1"><a class="header-anchor" href="#bytebuf类层次" aria-hidden="true">#</a> ByteBuf类层次</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>ByteBuf
├── AbstractByteBuf
│   ├── PooledByteBuf (池化)
│   │   ├── PooledHeapByteBuf
│   │   └── PooledDirectByteBuf
│   └── UnpooledByteBuf (非池化)
│       ├── UnpooledHeapByteBuf
│       └── UnpooledDirectByteBuf
├── CompositeByteBuf (组合)
└── EmptyByteBuf (空)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="bytebuf核心属性" tabindex="-1"><a class="header-anchor" href="#bytebuf核心属性" aria-hidden="true">#</a> ByteBuf核心属性</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// AbstractByteBuf.java</span>
<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">AbstractByteBuf</span> <span class="token keyword">extends</span> <span class="token class-name">ByteBuf</span> <span class="token punctuation">{</span>

    <span class="token comment">// 读写索引</span>
    <span class="token keyword">int</span> readerIndex<span class="token punctuation">;</span>
    <span class="token keyword">int</span> writerIndex<span class="token punctuation">;</span>

    <span class="token comment">// 标记索引</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> markedReaderIndex<span class="token punctuation">;</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> markedWriterIndex<span class="token punctuation">;</span>

    <span class="token comment">// 容量限制</span>
    <span class="token keyword">private</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">;</span>

    <span class="token comment">// 私有属性不对外暴露</span>
    <span class="token comment">// 子类实现真正的数据存储</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="读写索引操作" tabindex="-1"><a class="header-anchor" href="#读写索引操作" aria-hidden="true">#</a> 读写索引操作</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// AbstractByteBuf.java</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">readerIndex</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> readerIndex<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">AbstractByteBuf</span> <span class="token function">readerIndex</span><span class="token punctuation">(</span><span class="token keyword">int</span> readerIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>readerIndex <span class="token operator">&lt;</span> <span class="token number">0</span> <span class="token operator">||</span> readerIndex <span class="token operator">&gt;</span> writerIndex<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">IndexOutOfBoundsException</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">this</span><span class="token punctuation">.</span>readerIndex <span class="token operator">=</span> readerIndex<span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">writableBytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> capacity <span class="token operator">-</span> writerIndex<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">int</span> <span class="token function">readableBytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> writerIndex <span class="token operator">-</span> readerIndex<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isReadable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> writerIndex <span class="token operator">&gt;</span> readerIndex<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">boolean</span> <span class="token function">isWritable</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> capacity <span class="token operator">&gt;</span> writerIndex<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="pooledbytebuf内存分配" tabindex="-1"><a class="header-anchor" href="#pooledbytebuf内存分配" aria-hidden="true">#</a> PooledByteBuf内存分配</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// PooledByteBufAllocator.java - 获取ByteBuf</span>
<span class="token keyword">public</span> <span class="token class-name">ByteBuf</span> <span class="token function">buffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>directByDefault<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span>initialCapacity<span class="token punctuation">,</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">return</span> <span class="token function">heapBuffer</span><span class="token punctuation">(</span>initialCapacity<span class="token punctuation">,</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token class-name">ByteBuf</span> <span class="token function">directBuffer</span><span class="token punctuation">(</span><span class="token keyword">int</span> initialCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 从线程本地缓存获取</span>
    <span class="token class-name">PoolThreadCache</span> cache <span class="token operator">=</span> threadCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token class-name">PooledDirectByteBuf</span> buf <span class="token operator">=</span> cache<span class="token punctuation">.</span>directCache<span class="token punctuation">.</span><span class="token function">get</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>buf <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        buf<span class="token punctuation">.</span><span class="token function">reuse</span><span class="token punctuation">(</span>maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">return</span> buf<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 从Arena获取</span>
    <span class="token keyword">return</span> <span class="token function">newDirect0</span><span class="token punctuation">(</span>cache<span class="token punctuation">,</span> initialCapacity<span class="token punctuation">,</span> maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// PooledByteBuf.java - 重用ByteBuf</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token keyword">void</span> <span class="token function">reuse</span><span class="token punctuation">(</span><span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 重置索引</span>
    <span class="token function">setIndex</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">setMarkedIndex</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 重置容量</span>
    <span class="token function">maxCapacity</span><span class="token punctuation">(</span>maxCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 清除引用</span>
    <span class="token function">setRefCnt</span><span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="内存池架构" tabindex="-1"><a class="header-anchor" href="#内存池架构" aria-hidden="true">#</a> 内存池架构</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// PoolArena.java - 内存池核心</span>
<span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">PoolArena</span> <span class="token punctuation">{</span>

    <span class="token comment">// 堆内存池</span>
    <span class="token keyword">final</span> <span class="token class-name">PoolSubpage</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">[</span><span class="token punctuation">]</span> smallSubpagePools<span class="token punctuation">;</span>  <span class="token comment">// 4KB-16KB</span>
    <span class="token keyword">final</span> <span class="token class-name">PoolChunk</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">[</span><span class="token punctuation">]</span> hugeChunks<span class="token punctuation">;</span>             <span class="token comment">// &gt;16MB</span>

    <span class="token comment">// 分配内存</span>
    <span class="token class-name">PooledByteBuf</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">T</span><span class="token punctuation">&gt;</span></span> <span class="token function">allocate</span><span class="token punctuation">(</span><span class="token class-name">PoolThreadCache</span> cache<span class="token punctuation">,</span> <span class="token keyword">int</span> reqCapacity<span class="token punctuation">,</span> <span class="token keyword">int</span> maxCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 根据大小选择不同的分配策略</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>reqCapacity <span class="token operator">&gt;</span> chunkSize<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 大于chunkSize，使用huge</span>
            <span class="token keyword">return</span> <span class="token function">allocateHuge</span><span class="token punctuation">(</span>cache<span class="token punctuation">,</span> reqCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>reqCapacity <span class="token operator">&gt;</span> smallMaxCapacity<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 大于16KB，直接分配chunk</span>
            <span class="token keyword">return</span> <span class="token function">allocateNormal</span><span class="token punctuation">(</span>cache<span class="token punctuation">,</span> reqCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            <span class="token comment">// 小于16KB，从subpage池分配</span>
            <span class="token keyword">return</span> <span class="token function">allocateSubpage</span><span class="token punctuation">(</span>cache<span class="token punctuation">,</span> reqCapacity<span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="channelpipeline源码解析" tabindex="-1"><a class="header-anchor" href="#channelpipeline源码解析" aria-hidden="true">#</a> ChannelPipeline源码解析</h2><h3 id="defaultchannelpipeline结构" tabindex="-1"><a class="header-anchor" href="#defaultchannelpipeline结构" aria-hidden="true">#</a> DefaultChannelPipeline结构</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// DefaultChannelPipeline.java</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">DefaultChannelPipeline</span> <span class="token keyword">implements</span> <span class="token class-name">ChannelPipeline</span> <span class="token punctuation">{</span>

    <span class="token comment">// Head和Tail是特殊的Context</span>
    <span class="token keyword">final</span> <span class="token class-name">AbstractChannelHandlerContext</span> head<span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">AbstractChannelHandlerContext</span> tail<span class="token punctuation">;</span>

    <span class="token comment">// 内部的Channel</span>
    <span class="token keyword">private</span> <span class="token keyword">final</span> <span class="token class-name">Channel</span> channel<span class="token punctuation">;</span>

    <span class="token keyword">public</span> <span class="token class-name">DefaultChannelPipeline</span><span class="token punctuation">(</span><span class="token class-name">AbstractChannel</span> channel<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 创建TailContext</span>
        tail <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">TailContext</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// 创建HeadContext</span>
        head <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">HeadContext</span><span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 双向链表</span>
        head<span class="token punctuation">.</span>next <span class="token operator">=</span> tail<span class="token punctuation">;</span>
        tail<span class="token punctuation">.</span>prev <span class="token operator">=</span> head<span class="token punctuation">;</span>

        <span class="token keyword">this</span><span class="token punctuation">.</span>channel <span class="token operator">=</span> channel<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="handler添加过程" tabindex="-1"><a class="header-anchor" href="#handler添加过程" aria-hidden="true">#</a> Handler添加过程</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// DefaultChannelPipeline.java</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token keyword">final</span> <span class="token class-name">ChannelPipeline</span> <span class="token function">addLast</span><span class="token punctuation">(</span><span class="token class-name">EventExecutorGroup</span> group<span class="token punctuation">,</span>
                                     <span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">ChannelHandler</span> handler<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">AbstractChannelHandlerContext</span> newCtx<span class="token punctuation">;</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span><span class="token keyword">this</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 检查Handler是否可以添加多次</span>
        <span class="token function">checkMultiplicity</span><span class="token punctuation">(</span>handler<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 创建Context</span>
        newCtx <span class="token operator">=</span> <span class="token function">newContext</span><span class="token punctuation">(</span>group<span class="token punctuation">,</span> <span class="token function">filterName</span><span class="token punctuation">(</span>name<span class="token punctuation">,</span> handler<span class="token punctuation">)</span><span class="token punctuation">,</span> handler<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 添加到链表尾部</span>
        <span class="token function">addLast0</span><span class="token punctuation">(</span>newCtx<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 如果Channel未注册，延迟添加</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>registered<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            newCtx<span class="token punctuation">.</span><span class="token function">setAddPending</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token function">callHandlerCallbackLater</span><span class="token punctuation">(</span>newCtx<span class="token punctuation">,</span> <span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 在EventLoop中执行</span>
        <span class="token class-name">EventExecutor</span> executor <span class="token operator">=</span> newCtx<span class="token punctuation">.</span><span class="token function">executor</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>executor<span class="token punctuation">.</span><span class="token function">inEventLoop</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            newCtx<span class="token punctuation">.</span><span class="token function">setAddPending</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            executor<span class="token punctuation">.</span><span class="token function">execute</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token function">callHandlerAdded0</span><span class="token punctuation">(</span>newCtx<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
            <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 立即执行</span>
    <span class="token function">callHandlerAdded0</span><span class="token punctuation">(</span>newCtx<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">addLast0</span><span class="token punctuation">(</span><span class="token class-name">AbstractChannelHandlerContext</span> newCtx<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 插入到tail之前</span>
    <span class="token class-name">AbstractChannelHandlerContext</span> prev <span class="token operator">=</span> tail<span class="token punctuation">.</span>prev<span class="token punctuation">;</span>
    newCtx<span class="token punctuation">.</span>prev <span class="token operator">=</span> prev<span class="token punctuation">;</span>
    newCtx<span class="token punctuation">.</span>next <span class="token operator">=</span> tail<span class="token punctuation">;</span>
    prev<span class="token punctuation">.</span>next <span class="token operator">=</span> newCtx<span class="token punctuation">;</span>
    tail<span class="token punctuation">.</span>prev <span class="token operator">=</span> newCtx<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="事件传播机制" tabindex="-1"><a class="header-anchor" href="#事件传播机制" aria-hidden="true">#</a> 事件传播机制</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// AbstractChannelHandlerContext.java - 入站事件传播</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ChannelHandlerContext</span> <span class="token function">fireChannelRegistered</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 找到下一个Inbound Handler</span>
    <span class="token function">findContextInbound</span><span class="token punctuation">(</span><span class="token constant">MASK_CHANNEL_REGISTERED</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">invokeChannelRegistered</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ChannelHandlerContext</span> <span class="token function">fireChannelActive</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">findContextInbound</span><span class="token punctuation">(</span><span class="token constant">MASK_CHANNEL_ACTIVE</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">invokeChannelActive</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ChannelHandlerContext</span> <span class="token function">fireChannelRead</span><span class="token punctuation">(</span><span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">findContextInbound</span><span class="token punctuation">(</span><span class="token constant">MASK_CHANNEL_READ</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">invokeChannelRead</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token class-name">AbstractChannelHandlerContext</span> <span class="token function">findContextInbound</span><span class="token punctuation">(</span><span class="token keyword">int</span> mask<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">AbstractChannelHandlerContext</span> ctx <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
    <span class="token keyword">do</span> <span class="token punctuation">{</span>
        ctx <span class="token operator">=</span> ctx<span class="token punctuation">.</span>next<span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token punctuation">(</span>ctx<span class="token punctuation">.</span>executionMask <span class="token operator">&amp;</span> mask<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> ctx<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// 出站事件传播类似，从后往前找Outbound Handler</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ChannelFuture</span> <span class="token function">write</span><span class="token punctuation">(</span><span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">findContextOutbound</span><span class="token punctuation">(</span><span class="token constant">MASK_WRITE</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">write</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="bootstrap源码解析" tabindex="-1"><a class="header-anchor" href="#bootstrap源码解析" aria-hidden="true">#</a> Bootstrap源码解析</h2><h3 id="服务端启动流程" tabindex="-1"><a class="header-anchor" href="#服务端启动流程" aria-hidden="true">#</a> 服务端启动流程</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ServerBootstrap.java</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ServerBootstrap</span> <span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token keyword">int</span> inetPort<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> <span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">InetSocketAddress</span><span class="token punctuation">(</span>inetPort<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ServerBootstrap</span> <span class="token function">bind</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">SocketAddress</span> localAddress<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 校验参数</span>
    <span class="token function">validate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 执行绑定</span>
    <span class="token function">doBind0</span><span class="token punctuation">(</span>localAddress<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token keyword">void</span> <span class="token function">doBind0</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">SocketAddress</span> localAddress<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 1. 初始化并注册Channel</span>
    <span class="token keyword">final</span> <span class="token class-name">ChannelFuture</span> regFuture <span class="token operator">=</span> <span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">initAndRegister</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">final</span> <span class="token class-name">Channel</span> channel <span class="token operator">=</span> regFuture<span class="token punctuation">.</span><span class="token function">getNow</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 2. 绑定地址</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>regFuture<span class="token punctuation">.</span><span class="token function">isSuccess</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        channel<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span>localAddress<span class="token punctuation">,</span> promise<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addListener</span><span class="token punctuation">(</span><span class="token class-name">ChannelFutureListener</span><span class="token punctuation">.</span><span class="token constant">CLOSE_ON_FAILURE</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
        promise<span class="token punctuation">.</span><span class="token function">tryFailure</span><span class="token punctuation">(</span>regFuture<span class="token punctuation">.</span><span class="token function">cause</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// AbstractBootstrap.java</span>
<span class="token keyword">final</span> <span class="token class-name">ChannelFuture</span> <span class="token function">initAndRegister</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token class-name">Channel</span> channel <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
        <span class="token comment">// 1. 创建Channel</span>
        channel <span class="token operator">=</span> channelFactory<span class="token punctuation">.</span><span class="token function">newChannel</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token comment">// 2. 初始化Channel</span>
        <span class="token function">init</span><span class="token punctuation">(</span>channel<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span><span class="token class-name">Throwable</span> t<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 异常处理</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 3. 注册到EventLoopGroup</span>
    <span class="token class-name">ChannelFuture</span> regFuture <span class="token operator">=</span> <span class="token function">config</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">group</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>channel<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 4. 如果注册失败，关闭Channel</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>regFuture<span class="token punctuation">.</span><span class="token function">isSuccess</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>channel<span class="token punctuation">.</span><span class="token function">isRegistered</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            channel<span class="token punctuation">.</span><span class="token function">close</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>
            channel<span class="token punctuation">.</span><span class="token function">unsafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">closeForcibly</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token keyword">return</span> regFuture<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="channel初始化" tabindex="-1"><a class="header-anchor" href="#channel初始化" aria-hidden="true">#</a> Channel初始化</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ServerBootstrap.java - 初始化ServerSocketChannel</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">void</span> <span class="token function">init</span><span class="token punctuation">(</span><span class="token class-name">Channel</span> channel<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 设置ServerSocket的TCP参数</span>
    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ChannelOption</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> options <span class="token operator">=</span> <span class="token function">options0</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>options<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token function">setChannelOptions</span><span class="token punctuation">(</span>channel<span class="token punctuation">,</span> options<span class="token punctuation">,</span> promise<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 设置Attributes</span>
    <span class="token class-name">Map</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">AttributeKey</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> attrs <span class="token operator">=</span> <span class="token function">attrs0</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">synchronized</span> <span class="token punctuation">(</span>attrs<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">AttributeKey</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> e <span class="token operator">:</span> attrs<span class="token punctuation">.</span><span class="token function">entrySet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            channel<span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">AttributeKey</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">)</span> e<span class="token punctuation">.</span><span class="token function">getKey</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span><span class="token function">getValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 获取Pipeline</span>
    <span class="token class-name">ChannelPipeline</span> p <span class="token operator">=</span> channel<span class="token punctuation">.</span><span class="token function">pipeline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 保存配置</span>
    <span class="token keyword">final</span> <span class="token class-name">EventLoopGroup</span> currentChildGroup <span class="token operator">=</span> childGroup<span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">ChannelHandler</span> currentChildHandler <span class="token operator">=</span> childHandler<span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">ChannelOption</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token operator">?</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">[</span><span class="token punctuation">]</span> currentChildOptions <span class="token operator">=</span> childOptions<span class="token punctuation">.</span><span class="token function">entrySet</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span><span class="token function">newOptionArray</span><span class="token punctuation">(</span>childOptions<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">AttributeKey</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">[</span><span class="token punctuation">]</span> currentChildAttrs <span class="token operator">=</span> childAttrs<span class="token punctuation">.</span><span class="token function">entrySet</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">.</span><span class="token function">toArray</span><span class="token punctuation">(</span><span class="token function">newAttrArray</span><span class="token punctuation">(</span>childAttrs<span class="token punctuation">.</span><span class="token function">size</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 添加ServerBootstrapAcceptor - 接收客户端连接</span>
    p<span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ChannelInitializer</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Channel</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token annotation punctuation">@Override</span>
        <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">initChannel</span><span class="token punctuation">(</span><span class="token class-name">Channel</span> ch<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            ch<span class="token punctuation">.</span><span class="token function">pipeline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ServerBootstrapAcceptor</span><span class="token punctuation">(</span>
                currentChildGroup<span class="token punctuation">,</span>
                currentChildHandler<span class="token punctuation">,</span>
                currentChildOptions<span class="token punctuation">,</span>
                currentChildAttrs
            <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="serverbootstrapacceptor" tabindex="-1"><a class="header-anchor" href="#serverbootstrapacceptor" aria-hidden="true">#</a> ServerBootstrapAcceptor</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ServerBootstrap.java 内部类</span>
<span class="token keyword">private</span> <span class="token keyword">class</span> <span class="token class-name">ServerBootstrapAcceptor</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 接收到客户端连接</span>
        <span class="token keyword">final</span> <span class="token class-name">Channel</span> child <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token class-name">Channel</span><span class="token punctuation">)</span> msg<span class="token punctuation">;</span>

        <span class="token comment">// 添加子Channel的Handler</span>
        child<span class="token punctuation">.</span><span class="token function">pipeline</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span>childHandler<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 设置子Channel的TCP参数</span>
        <span class="token function">setChannelOptions</span><span class="token punctuation">(</span>child<span class="token punctuation">,</span> childOptions<span class="token punctuation">,</span> promise<span class="token punctuation">)</span><span class="token punctuation">;</span>

        <span class="token comment">// 设置子Channel的Attributes</span>
        <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">Entry</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">AttributeKey</span><span class="token punctuation">&lt;</span><span class="token operator">?</span><span class="token punctuation">&gt;</span><span class="token punctuation">,</span> <span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span> e <span class="token operator">:</span> childAttrs<span class="token punctuation">.</span><span class="token function">entrySet</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            child<span class="token punctuation">.</span><span class="token function">attr</span><span class="token punctuation">(</span><span class="token punctuation">(</span><span class="token class-name">AttributeKey</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">Object</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">)</span> e<span class="token punctuation">.</span><span class="token function">getKey</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>e<span class="token punctuation">.</span><span class="token function">getValue</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>

        <span class="token comment">// 注册到Worker Group</span>
        childGroup<span class="token punctuation">.</span><span class="token function">register</span><span class="token punctuation">(</span>child<span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">addListener</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">ChannelFutureListener</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token annotation punctuation">@Override</span>
            <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">operationComplete</span><span class="token punctuation">(</span><span class="token class-name">ChannelFuture</span> future<span class="token punctuation">)</span> <span class="token punctuation">{</span>
                <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>future<span class="token punctuation">.</span><span class="token function">isSuccess</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
                    child<span class="token punctuation">.</span><span class="token function">closeForcibly</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
                <span class="token punctuation">}</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="客户端连接流程" tabindex="-1"><a class="header-anchor" href="#客户端连接流程" aria-hidden="true">#</a> 客户端连接流程</h2><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Bootstrap.java</span>
<span class="token annotation punctuation">@Override</span>
<span class="token keyword">public</span> <span class="token class-name">ChannelFuture</span> <span class="token function">connect</span><span class="token punctuation">(</span><span class="token class-name">SocketAddress</span> remoteAddress<span class="token punctuation">,</span> <span class="token class-name">SocketAddress</span> localAddress<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token function">validate</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 如果没有指定本地地址，直接连接</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>localAddress <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token function">doConnect</span><span class="token punctuation">(</span>remoteAddress<span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 绑定本地地址后再连接</span>
    <span class="token keyword">final</span> <span class="token class-name">ChannelFuture</span> regFuture <span class="token operator">=</span> <span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">initAndRegister</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">final</span> <span class="token class-name">Channel</span> channel <span class="token operator">=</span> regFuture<span class="token punctuation">.</span><span class="token function">getNow</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 绑定本地地址</span>
    channel<span class="token punctuation">.</span><span class="token function">bind</span><span class="token punctuation">(</span>localAddress<span class="token punctuation">,</span> regFuture<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">return</span> <span class="token function">doConnect</span><span class="token punctuation">(</span>remoteAddress<span class="token punctuation">,</span> regFuture<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">private</span> <span class="token class-name">ChannelFuture</span> <span class="token function">doConnect</span><span class="token punctuation">(</span><span class="token keyword">final</span> <span class="token class-name">SocketAddress</span> remoteAddress<span class="token punctuation">,</span>
                                <span class="token keyword">final</span> <span class="token class-name">ChannelPromise</span> regFuture<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">final</span> <span class="token class-name">Channel</span> channel <span class="token operator">=</span> <span class="token keyword">this</span><span class="token punctuation">.</span>channel<span class="token punctuation">;</span>

    <span class="token comment">// 尝试连接</span>
    <span class="token function">doConnect</span><span class="token punctuation">(</span>remoteAddress<span class="token punctuation">,</span> channel<span class="token punctuation">.</span><span class="token function">newPromise</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 等待注册完成</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>regFuture<span class="token punctuation">.</span><span class="token function">isDone</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> channel<span class="token punctuation">.</span><span class="token function">connect</span><span class="token punctuation">(</span>remoteAddress<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token comment">// ...</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="内存分配流程图" tabindex="-1"><a class="header-anchor" href="#内存分配流程图" aria-hidden="true">#</a> 内存分配流程图</h2><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>请求分配ByteBuf
       │
       ▼
┌─────────────────┐
│ PooledAllocator│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ThreadCache   │  ← 尝试从线程本地缓存获取
└────────┬────────┘
         │
         ▼ 有缓存? ──是──&gt; 返回缓存的ByteBuf
         │
         否
         ▼
┌─────────────────┐
│   PoolArena    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
HeapArena  DirectArena
    │         │
    ▼         ▼
┌───────────┐ ┌───────────┐
│ req&lt;16KB  │ │ req&lt;16KB  │  ──&gt; 从Subpage分配
│ req&gt;=16KB │ │ req&gt;=16KB │  ──&gt; 从Chunk分配
└───────────┘ └───────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="关键设计模式" tabindex="-1"><a class="header-anchor" href="#关键设计模式" aria-hidden="true">#</a> 关键设计模式</h2><h3 id="_1-装饰器模式" tabindex="-1"><a class="header-anchor" href="#_1-装饰器模式" aria-hidden="true">#</a> 1. 装饰器模式</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ByteBuf的各种装饰器</span>
<span class="token class-name">ByteBuf</span> buf <span class="token operator">=</span> <span class="token class-name">Unpooled</span><span class="token punctuation">.</span><span class="token function">buffer</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">CompressedByteBuf</span> compressed <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">CompressedByteBuf</span><span class="token punctuation">(</span>buf<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">EncryptedByteBuf</span> encrypted <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">EncryptedByteBuf</span><span class="token punctuation">(</span>compressed<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 层层装饰，功能叠加</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-责任链模式" tabindex="-1"><a class="header-anchor" href="#_2-责任链模式" aria-hidden="true">#</a> 2. 责任链模式</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ChannelPipeline中的Handler链</span>
pipeline
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Decoder1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">Decoder2</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">addLast</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">BusinessHandler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">// 数据依次通过每个Handler</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-适配器模式" tabindex="-1"><a class="header-anchor" href="#_3-适配器模式" aria-hidden="true">#</a> 3. 适配器模式</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ChannelInboundHandlerAdapter</span>
<span class="token keyword">public</span> <span class="token keyword">abstract</span> <span class="token keyword">class</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelHandlerAdapter</span> <span class="token punctuation">{</span>
    <span class="token comment">// 提供默认实现，子类只需重写感兴趣的方法</span>
<span class="token punctuation">}</span>

<span class="token comment">// 使用时</span>
<span class="token keyword">class</span> <span class="token class-name">MyHandler</span> <span class="token keyword">extends</span> <span class="token class-name">ChannelInboundHandlerAdapter</span> <span class="token punctuation">{</span>
    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">channelRead</span><span class="token punctuation">(</span><span class="token class-name">ChannelHandlerContext</span> ctx<span class="token punctuation">,</span> <span class="token class-name">Object</span> msg<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token comment">// 只处理这个方法</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-工厂模式" tabindex="-1"><a class="header-anchor" href="#_4-工厂模式" aria-hidden="true">#</a> 4. 工厂模式</h3><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// ByteBufAllocator工厂</span>
<span class="token class-name">ByteBufAllocator</span> allocator <span class="token operator">=</span> <span class="token class-name">PooledByteBufAllocator</span><span class="token punctuation">.</span><span class="token constant">DEFAULT</span><span class="token punctuation">;</span>
<span class="token comment">// 内部根据配置创建不同类型的Allocator</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>Netty源码解析的关键点：</p><ol><li><p><strong>NioEventLoop</strong>：</p><ul><li>基于Selector的Reactor实现</li><li>select()方法处理空轮询问题</li><li>IO事件和任务按比例执行</li></ul></li><li><p><strong>ByteBuf</strong>：</p><ul><li>readerIndex和writerIndex分离</li><li>池化内存减少GC</li><li>引用计数管理内存</li></ul></li><li><p><strong>ChannelPipeline</strong>：</p><ul><li>双向链表管理Handler</li><li>入站事件从前往后传播</li><li>出站事件从后往前传播</li></ul></li><li><p><strong>Bootstrap</strong>：</p><ul><li>简洁的启动流程</li><li>ServerBootstrapAcceptor处理连接</li><li>Channel初始化和注册分离</li></ul></li></ol><p>通过源码学习，可以更深入理解Netty的设计理念和性能优化手段。</p>`,54),c=[p];function o(l,i){return s(),a("div",null,c)}const k=n(t,[["render",o],["__file","Nettyyuanmajiexi.html.vue"]]);export{k as default};
