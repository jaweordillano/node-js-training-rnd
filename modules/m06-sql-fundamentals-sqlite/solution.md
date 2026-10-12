# M06 — Solution: the 24 query exercises

**Module M06 · Solution for the section 5 exercises**

Every answer to the exercise set, the result you should get, and the reason each query is written that way. Try the exercises first, because you learn most from the ones you work out yourself.

## Before you read

> **Try the exercises first.** This page has every answer. Go back to [section 5](index.md) and try each exercise before you look. If a query is wrong, `npm run sql:check` tells you which exercise failed. Come here when you are stuck, or when everything passes and you want to compare your queries with these.

Your query does not have to match mine word for word. It passes if it returns the same rows, in the same order, with the same columns in the same order. There are often several correct ways to write one. The results below come from the seed data in `sql/seed.sql`, run on the SQLite command line with `.headers on` and `.mode column`.

## 1. Filtering

### Exercise 01

List the id and title of every task whose status is `todo`.

```sql
SELECT id, title
FROM tasks
WHERE status = 'todo'
ORDER BY id;
```

*You should see:*

```text
id         title
--  --------------------
 5  Fix login redirect
 7  Write API docs
 8  Fix date bug
 9  Add tag filter
12  Update README
13  Plan next sprint
15  Back up the database
```

`WHERE` keeps the rows where the condition is true. Text values go in single quotes.

### Exercise 02

List the id and title of every task whose title contains the word `page`.

```sql
SELECT id, title
FROM tasks
WHERE title LIKE '%page%'
ORDER BY id;
```

*You should see:*

```text
id          title
--  ---------------------
 4  Build login page
14  Fix typo on home page
```

`LIKE` matches patterns, and `%` stands for any run of characters. `%page%` means "contains page" (`LIKE` ignores case for plain letters in SQLite).

### Exercise 03

List the id and title of every task that has no description.

```sql
SELECT id, title
FROM tasks
WHERE description IS NULL
ORDER BY id;
```

*You should see:*

```text
id          title
--  ----------------------
 3  Write seed data
 6  Add task list endpoint
10  Review pull requests
12  Update README
14  Fix typo on home page
```

A missing value is `NULL`, and you cannot test it with `=`. Use `IS NULL`.

### Exercise 04

List the id and title of every task that is not `done` and was created on or after `2026-10-05`.

```sql
SELECT id, title
FROM tasks
WHERE status <> 'done' AND created_at >= '2026-10-05'
ORDER BY id;
```

*You should see:*

```text
id         title
--  --------------------
 9  Add tag filter
11  Speed up search
12  Update README
13  Plan next sprint
15  Back up the database
```

`<>` means "not equal". The two conditions are joined with `AND`, so both must hold. Dates stored as `YYYY-MM-DD HH:MM:SS` text sort and compare correctly as text.

### Exercise 05

List the id, title and status of tasks that are `todo` or `in_progress` and owned by user 3 or user 4.

```sql
SELECT id, title, status
FROM tasks
WHERE status IN ('todo', 'in_progress') AND user_id IN (3, 4)
ORDER BY id;
```

*You should see:*

```text
id        title           status
--  ------------------  -----------
 4  Build login page    in_progress
 5  Fix login redirect  todo
 8  Fix date bug        todo
11  Speed up search     in_progress
```

`IN (...)` is a short way to write several `OR` tests. `AND` binds both groups: the status test and the owner test.

## 2. Sorting and pagination

### Exercise 06

List the id and title of the 3 newest tasks, newest first.

```sql
SELECT id, title
FROM tasks
ORDER BY created_at DESC, id DESC
LIMIT 3;
```

*You should see:*

```text
id          title
--  ---------------------
15  Back up the database
14  Fix typo on home page
13  Plan next sprint
```

Sort newest first with `DESC`, and `LIMIT 3` keeps the first three rows. The second sort key, `id`, decides ties.

### Exercise 07

Page 2 of the tasks, sorted by id, with 5 tasks per page.

```sql
SELECT id, title
FROM tasks
ORDER BY id
LIMIT 5 OFFSET 5;
```

*You should see:*

```text
id          title
--  ----------------------
 6  Add task list endpoint
 7  Write API docs
 8  Fix date bug
 9  Add tag filter
10  Review pull requests
```

`LIMIT 5 OFFSET 5` skips the first 5 rows and returns the next 5. Page number `p` with size `s` is `OFFSET (p - 1) * s`.

### Exercise 08

Keyset pagination: the next 4 tasks after the task with id 9, sorted by id. Do not use `OFFSET`.

```sql
SELECT id, title
FROM tasks
WHERE id > 9
ORDER BY id
LIMIT 4;
```

*You should see:*

```text
id         title
--  --------------------
10  Review pull requests
11  Speed up search
12  Update README
13  Plan next sprint
```

Keyset pagination remembers the last id you saw and asks for rows after it. It stays fast on big tables, because the database does not count past skipped rows, and it stays correct when rows are added while you page.

## 3. Joins

### Exercise 10

List each task's title with its owner's name. Leave out tasks that have no owner (an `INNER JOIN`).

```sql
SELECT t.title, u.name
FROM tasks AS t
INNER JOIN users AS u ON u.id = t.user_id
ORDER BY t.id;
```

*You should see:*

```text
        title           name
----------------------  ----
Set up project          Ana
Design schema           Ana
Write seed data         Ben
Build login page        Cara
Fix login redirect      Cara
...
(13 rows in total; the first 5 are shown)
```

`INNER JOIN` keeps a task only if a matching user exists, so the two tasks with `user_id` of `NULL` disappear (13 rows, not 15).

### Exercise 11

List each task's title with its owner's name, and keep the tasks that have no owner (their name is `NULL`). Use a `LEFT JOIN`.

```sql
SELECT t.title, u.name
FROM tasks AS t
LEFT JOIN users AS u ON u.id = t.user_id
ORDER BY t.id;
```

*You should see:*

```text
        title           name
----------------------  ----
Set up project          Ana
Design schema           Ana
Write seed data         Ben
Build login page        Cara
Fix login redirect      Cara
...
(15 rows in total; the first 5 are shown)
```

`LEFT JOIN` keeps every row from the left table (`tasks`) and fills the right side with `NULL` when nothing matches.

### Exercise 12

List the names of users who own no tasks.

```sql
SELECT u.name
FROM users AS u
LEFT JOIN tasks AS t ON t.user_id = u.id
WHERE t.id IS NULL
ORDER BY u.name;
```

*You should see:*

```text
name
----
Eli
```

The `LEFT JOIN` gives a user with no tasks one row where every `tasks` column is `NULL`. `WHERE t.id IS NULL` keeps exactly those rows.

### Exercise 13

List every task-and-tag pair: the task title and the tag name.

```sql
SELECT t.title, g.name AS tag
FROM tasks AS t
JOIN task_tags AS tt ON tt.task_id = t.id
JOIN tags AS g ON g.id = tt.tag_id
ORDER BY t.id, g.name;
```

*You should see:*

```text
        title             tag
----------------------  --------
Set up project          backend
Design schema           backend
Design schema           feature
Write seed data         backend
Build login page        feature
...
(23 rows in total; the first 5 are shown)
```

Two joins walk the many-to-many link: tasks to `task_tags`, then `task_tags` to tags. Each pair becomes one row, so a task with 3 tags appears 3 times.

### Exercise 14

List the id and title of every task tagged `bug`.

```sql
SELECT t.id, t.title
FROM tasks AS t
JOIN task_tags AS tt ON tt.task_id = t.id
JOIN tags AS g ON g.id = tt.tag_id
WHERE g.name = 'bug'
ORDER BY t.id;
```

*You should see:*

```text
id          title
--  ---------------------
 5  Fix login redirect
 8  Fix date bug
14  Fix typo on home page
```

The same two joins, with a `WHERE` on the tag name to pick one tag.

### Exercise 15

List the names of tags that no task uses.

```sql
SELECT g.name
FROM tags AS g
LEFT JOIN task_tags AS tt ON tt.tag_id = g.id
WHERE tt.task_id IS NULL
ORDER BY g.name;
```

*You should see:*

```text
name
-----
ideas
```

The same trick as exercise 12, applied to tags: a tag with no `task_tags` row has `NULL` on the right side.

## 4. Aggregates and HAVING

### Exercise 09

List the title and the number of tags of every task that has 3 or more tags.

```sql
SELECT t.title, COUNT(*) AS tag_count
FROM tasks AS t
JOIN task_tags AS tt ON tt.task_id = t.id
GROUP BY t.id
HAVING COUNT(*) >= 3
ORDER BY t.title;
```

*You should see:*

```text
        title          tag_count
---------------------  ---------
Fix login redirect             3
Fix typo on home page          3
```

Join to the junction table, `GROUP BY` the task, and keep groups with `HAVING`. `HAVING` filters groups after counting, and `WHERE` filters rows before.

### Exercise 16

Count the tasks in each status.

```sql
SELECT status, COUNT(*) AS total
FROM tasks
GROUP BY status
ORDER BY status;
```

*You should see:*

```text
  status     total
-----------  -----
done             5
in_progress      3
todo             7
```

`GROUP BY status` makes one group per status, and `COUNT(*)` counts the rows in each group.

### Exercise 17

List every user's name and how many tasks they own. Users with no tasks show 0.

```sql
SELECT u.name, COUNT(t.id) AS total
FROM users AS u
LEFT JOIN tasks AS t ON t.user_id = u.id
GROUP BY u.id
ORDER BY u.name;
```

*You should see:*

```text
name  total
----  -----
Ana       4
Ben       3
Cara      3
Dev       3
Eli       0
```

Use `COUNT(t.id)`, not `COUNT(*)`: a user with no tasks still has one joined row, but `t.id` is `NULL` there and `COUNT(column)` skips `NULL`, so you get 0.

### Exercise 18

List the names of users who own more than 3 tasks.

```sql
SELECT u.name
FROM users AS u
JOIN tasks AS t ON t.user_id = u.id
GROUP BY u.id
HAVING COUNT(*) > 3
ORDER BY u.name;
```

*You should see:*

```text
name
----
Ana
```

`HAVING COUNT(*) > 3` keeps only the groups with more than 3 rows. Only Ana has 4 tasks.

### Exercise 19

List the 3 most-used tags and how many tasks use each. Break ties by tag name.

```sql
SELECT g.name, COUNT(*) AS total
FROM tags AS g
JOIN task_tags AS tt ON tt.tag_id = g.id
GROUP BY g.id
ORDER BY total DESC, g.name
LIMIT 3;
```

*You should see:*

```text
  name    total
--------  -----
backend       7
feature       4
frontend      4
```

Count per tag, sort by the count descending, and use the name as a tie-breaker so the order is the same every time.

### Exercise 20

For each user who has at least one `done` task, list the name and how many `done` tasks they have.

```sql
SELECT u.name, COUNT(*) AS done_total
FROM users AS u
JOIN tasks AS t ON t.user_id = u.id
WHERE t.status = 'done'
GROUP BY u.id
ORDER BY u.name;
```

*You should see:*

```text
name  done_total
----  ----------
Ana            2
Ben            1
Cara           1
Dev            1
```

`WHERE` removes the non-done rows before grouping, so users with no done tasks have no group at all.

### Exercise 21

Find the earliest and the latest `created_at` among all tasks (one row).

```sql
SELECT MIN(created_at) AS first_created, MAX(created_at) AS last_created
FROM tasks;
```

*You should see:*

```text
   first_created        last_created
-------------------  -------------------
2026-10-01 09:00:00  2026-10-08 08:00:00
```

`MIN` and `MAX` work on text too. With no `GROUP BY`, all the rows form one group, so you get one row.

## 5. Subqueries

### Exercise 22

List the title of every task owned by the user who owns the most tasks. Use a subquery, and do not hard-code the user.

```sql
SELECT title
FROM tasks
WHERE user_id = (
  SELECT user_id
  FROM tasks
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  ORDER BY COUNT(*) DESC
  LIMIT 1
)
ORDER BY id;
```

*You should see:*

```text
    title
--------------
Set up project
Design schema
Write API docs
Update README
```

The inner query finds the user id with the highest count, and the outer query uses it. Nothing is hard-coded, so the answer follows the data. The `IS NOT NULL` filter stops unassigned tasks from counting as a "user".

### Exercise 23

List the id and title of every task that has no tags. Use `NOT EXISTS` or `NOT IN`.

```sql
SELECT id, title
FROM tasks AS t
WHERE NOT EXISTS (SELECT 1 FROM task_tags AS tt WHERE tt.task_id = t.id)
ORDER BY id;
```

*You should see:*

```text
id         title
--  --------------------
10  Review pull requests
13  Plan next sprint
```

`NOT EXISTS` asks whether the inner query finds any row for this task, and keeps the task when it finds none. (`NOT IN` also works, but gives wrong answers if the subquery can return `NULL`.)

### Exercise 24

List the names of users who own at least one `done` task, using an `IN` subquery.

```sql
SELECT name
FROM users
WHERE id IN (SELECT user_id FROM tasks WHERE status = 'done')
ORDER BY name;
```

*You should see:*

```text
name
----
Ana
Ben
Cara
Dev
```

The inner query returns the user ids that have a done task, and `IN` keeps the users whose id is in that list. A user with two done tasks is still listed once.

## 6. Common mistakes

### Testing for NULL with =

```sql
SELECT id, title FROM tasks WHERE description = NULL;
```

*You should see:*

```text
(no rows)
```

No rows, and no error. `NULL` means "unknown", and nothing equals unknown, not even `NULL`. Write `IS NULL`.

### Forgetting the join condition

```sql
SELECT COUNT(*) AS rows_returned FROM tasks, users;
```

*You should see:*

```text
rows_returned
-------------
           75
```

15 tasks times 5 users is 75 rows: every task paired with every user. A join without an `ON` condition is a cross join. If a result is far bigger than you expect, check the `ON`.

### Filtering the right table of a LEFT JOIN in WHERE

```sql
SELECT COUNT(*) AS rows_returned
FROM tasks AS t
LEFT JOIN users AS u ON u.id = t.user_id
WHERE u.name = 'Ana';
```

*You should see:*

```text
rows_returned
-------------
            4
```

Only Ana's tasks come back. The `WHERE` throws away the rows where `u.name` is `NULL`, so the unassigned tasks that the `LEFT JOIN` kept are gone again, and the query behaves like an `INNER JOIN`. To keep them, put the condition in the `ON` clause, or test `u.name IS NULL OR ...`.

### Using WHERE where you need HAVING

`WHERE` runs before the groups exist, so it cannot see `COUNT(*)`. Use `WHERE` for conditions on single rows and `HAVING` for conditions on groups, as in exercises 9 and 18.

Back to [the exercises](index.md). Next: [6. Indexes, EXPLAIN QUERY PLAN and transactions](index.md).
