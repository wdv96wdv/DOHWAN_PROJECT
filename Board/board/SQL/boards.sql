--데이터 추가

insert into boards (id, title, writer, content) 
select UUID(), title, writer, content from boards;