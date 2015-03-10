
<div class="yi-reader">
	<div class="page">
		<span class="item"><img src="<%=current.src%>" width="500" /></span>
	</div>
	<div class="nav">
		<ul class="list">
			<%data.forEach(function(o){%>
				<li data-src="<%=o.big%>"><img src="<%=o.thumb%>" /></li>
			<%})%>
		</ul>
		<div class="scroll">
			
		</div>
	</div>
</div>