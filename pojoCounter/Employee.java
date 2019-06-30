public class Employee {
    private String name;
    private String id;
    private double salary;

    public Employee(String name, String id, double salary) {
        this.name = name;
        this.id = id;
        this.salary = salary;
    }
    
    public String getName() { return name; }

    public String getId() {
        return id;
    }

    public Double getSalary() {
        return salary;
    }

    public String setName() {
        return name;
    }

    public String setId() {
        return id;
    }
    
    public void setSalary(Double salary) {
        if (salary > 50) 
            this.salary = salary;
    }

    public String toString() {

    }

    public boolean equals() {
        
    }

}