<ol class="fix">
	<% if(current == 1) { %>
	<li class="current">1</li>
	<% } else { %>
	<li><a href="#" rel="1">1</a></li>
	<% } %>
	<% if(current > radio + 2) { %>
	<li>...</li>
	<% } %>
	<% for(var i = Math.max(2, current - radio); i <= Math.min(current + radio, total - 1); i++) { %>
		<% if(i == current) { %>
	<li class="current"><%=i%></li>
		<% } else { %>
	<li><a href="#" rel="<%=i%>"><%=i%></a></li>
		<% } %>
	<% }; %>
	<% if(i < total) { %>
	<li>...</li>
	<% } %>
	<% if(current == total && total > 1) { %>
	<li class="current"><%=total%></li>
	<% } else if(total > 1) { %>
	<li><a href="#" rel="<%=total%>"><%=total%></a></li>
	<% } %>
</ol>
<div class="fix">
	<% if(current == 1) { %>
	<span class="prev">上一页</span>
	<% } else { %>
	<a href="#" rel="<%=current-1%>" class="prev" title="上一页">上一页</a>
	<% } %>
	<% if(current == total) { %>
	<span class="next">下一页</span>
	<% } else { %>
	<a href="#" rel="<%=current+1%>" class="next" title="下一页">下一页</a>
	<% } %>
	<span class="count"><%=current%>/<%=total%></span>
</div>