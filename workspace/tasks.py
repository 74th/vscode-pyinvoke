from invoke import task

@task
def task1(c):
    c.run("echo task1")

@task
def task2(c):
    c.run("echo task2")
