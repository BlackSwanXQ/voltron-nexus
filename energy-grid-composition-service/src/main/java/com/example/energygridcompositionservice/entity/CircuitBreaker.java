package com.example.energygridcompositionservice.entity;

import com.example.energygridcompositionservice.entity.enums.BreakerRole;
import com.example.energygridcompositionservice.entity.enums.BreakerState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "circuit_breakers")
public class CircuitBreaker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "voltage", nullable = false)
    private int voltage;

    @Enumerated(EnumType.STRING)
    private BreakerState status;

    @Column(name = "x", nullable = false)
    private int x;

    @Column(name="y", nullable = false)
    private int y;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name="height", nullable = false)
    private int height;

//    @Enumerated(EnumType.STRING)
//    private BreakerRole role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "element_a_id")
    private ConnectedElement elementA;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "element_b_id")
    private ConnectedElement elementB;

    public CircuitBreaker() {}



    public boolean isConnectedTo(ConnectedElement element) {
        return elementA.equals(element) || elementB.equals(element);
    }

    public ConnectedElement getOtherElement(ConnectedElement element) {
        if (elementA.equals(element)) return elementB;
        if (elementB.equals(element)) return elementA;
        return null;
    }

    public boolean connectsLineToBus() {
        return (elementA instanceof PowerLine && elementB instanceof Busbar) ||
                (elementA instanceof Busbar && elementB instanceof PowerLine);
    }

    public boolean connectsTwoLines() {
        return elementA instanceof PowerLine && elementB instanceof PowerLine;
    }

    public boolean connectsBusToTransformer() {
        return (elementA instanceof Busbar && elementB instanceof Transformer) ||
                (elementA instanceof Transformer && elementB instanceof Busbar);
    }

    // Геттеры/сеттеры


    @Override
    public String toString() {
        return "CircuitBreaker{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", voltage=" + voltage +
                ", status=" + status +
                ", x=" + x +
                ", y=" + y +
                ", width=" + width +
                ", height=" + height +
                ", elementA=" + elementA +
                ", elementB=" + elementB +
                '}';
    }
}