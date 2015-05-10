<h3>登录</h3>
<a href="#" class="close" data-role="close">X</a>
<form id="loginForm">
	<div class="l"><input class="tel" name="name" type="text" placeholder="用户名" /></div>
	<div class="l"><input class="pwd" name="pwd" type="password" placeholder="密码" /></div>
	<div class="l"><input class="codeipt" name="code" type="text" placeholder="验证码" /><img src="<%=domain%>get_code.php?load=yes&id=<%=code%>&<%=t%>"  codeId="<%=code%>" class="code" /></div>
	<div class="btn">
		<a class="submit" href="#">登 录</a>
	</div>
</form>