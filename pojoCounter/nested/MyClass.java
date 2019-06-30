public class MyClass
{
    private String realName;
    private String realId;
    private double realSalary;

    public MyClass(String name, String id, double salary) {
        this.name = name;
        this.id = id;
        this.salary = salary;
    }

    public static class EmployeeBuilder {
        
    }

    public String getRealName() { return name; }

    public Double getRealSalary() {
        return salary;
    }

    public String setRealName() {
        return name;
    }

    public String setRealId() {
        return id;
    }
    
    public Double setRealSalary() {
        return salary;
    }

    public String toString() {

    }

}