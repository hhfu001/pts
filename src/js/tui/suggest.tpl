<div class="g_search_p">
<%data.forEach(function(dt){%>
	<%
		var cate = dt.m || '';
		var url = dt.d;
		var person = dt.p || '';
		var area = dt.w || '';
		var bstyle = dt.b || '';
		
		
		if(dt.e == 2){
			dt.j = dt.n;
			dt.a = dt.p;
			url = dt.u;
		}		
	%>	
		<div class="g_search_pack" data-e="<%=dt.e%>" ord="<%=dt.ord%>" <%if(dt.ord == 0){%> style="display:block"<%}%>>
			<div class="pic<%if(dt.e == 2){%> pic_u<%}%>">
				<a href="<%=url%>" target="_blank" pos="2" title="<%=dt.j%>"><img src="<%=dt.a%>" /></a>
			</div>			
			<h4><a href="<%=url%>" target="_blank" title="<%=dt.j%>"  pos="2" ><%=dt.j%></a></h4>
			
			<ul class="txt">
			
				<%if(cate){%>
					<li><%=cate%></li>
				<%}%>
				
				<%if(person && cate !== "动漫" && dt.e != 2){%>
					<li><%=(cate === "电影" || cate === "电视剧") ? "主演" : "主持人"%>: <%=person%></li>
				<%}%>
				
				<%if (cate === "电视剧" || cate === "电影" || cate === "动漫") {%>
					<li>年代: <%=dt.y%></li>
				<%}%>
			
			
				<%if(area && cate !== "电视剧" && cate !== "电影") {%>
					<li>地区: <%=area%></li>
				<%}%>
				
				<%if(bstyle === "1"){%>
					<li class="goplay"><a href="<%=dt.k%>" target="_blank" pos="5" >继续看</a></li>
				<%}else if(dt.e != 2){%>
					<li class="play"><a href="<%=dt.k%>" target="_blank"  pos="3">播放</a></li>				
				<%}%>
				
				<%if(dt.e == 2){%>
					<li>节目：<%=split(dt.c)%></li>
					<li>订阅：<%=split(dt.f)%></li>
					<li style="height:30px;"></li>
				<%}%>
				
			</ul>		
		
			<%if (url.indexOf('www.tudou.com/albumplay') != -1 || url.indexOf('www.tudou.com/albumcover') != -1 || dt.e == 2) {%>
				<%if(logined){%>
					<a href="#" class="gbtn_sub gBtnSub" data-type="<%=dt.e%>" data-id="<%=dt.i%>" style="display:none;"></a>
				<%}else{%>
					<span class="gbtn_sub gBtnSub" data-type="<%=dt.e%>" data-id="<%=dt.i%>" style="display:none;"><a title="点击订阅" href="#"><i class="iconfont">&#xe637;</i>订阅</a></span>
				<%}%>			
			<%}%>
		
		</div>

<%});%>
</div>