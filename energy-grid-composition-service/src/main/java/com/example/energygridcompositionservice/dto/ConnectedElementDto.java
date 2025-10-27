package com.example.energygridcompositionservice.dto;

// DTO для подключенных элементов
public class ConnectedElementDto {
    private String type;
    private String id;
    private String name;

    // Constructors
    public ConnectedElementDto() {}

    public ConnectedElementDto(String type, String   id, String name) {
        this.type = type;
        this.id = id;
        this.name = name;
    }

    public ConnectedElementDto(String name) {
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String  getId() {
        return id;
    }

    public void setId(String  id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "ConnectedElementDto{" +
                "type='" + type + '\'' +
                ", id='" + id + '\'' +
                ", name='" + name + '\'' +
                '}';
    }

}