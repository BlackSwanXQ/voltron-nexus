package com.example.currentflowanalyzer;
import com.example.currentflowanalyzer.services.Source;
import java.util.*;
public class ClassicalSuperpositionSolver2 {

    private final Map<String, List<String>> networkConnections;
    private final Set<String> disabledBranches;
    private final List<Source> sources;
    private final Map<String, Double> loads;
    private final Set<String> allNodes;

    // Вспомогательный класс для источников


    public ClassicalSuperpositionSolver2(Map<String, List<String>> networkConnections,
                                         List<Source> sources,
                                         Map<String, Double> loads) {
        this(networkConnections, new HashSet<>(), sources, loads);
    }

    public ClassicalSuperpositionSolver2(Map<String, List<String>> networkConnections,
                                         Set<String> disabledBranches,
                                         List<Source> sources,
                                         Map<String, Double> loads) {
        this.networkConnections = networkConnections;
        this.disabledBranches = disabledBranches;
        this.sources = sources;
        this.loads = loads;
        this.allNodes = calculateAllNodes();
    }

    private Set<String> calculateAllNodes() {
        Set<String> nodes = new HashSet<>();
        for (List<String> connection : networkConnections.values()) {
            nodes.addAll(connection);
        }
        return nodes;
    }

    public Map<String, Double> solve() {


//        solver1.solve();

//        Set<String> Q = new HashSet<>();
//        Q.add("Q L1/L2");
////        Q.add("Q L5/L6");
//        Q.add("Q L3/L4");
//
//        ClassicalSuperpositionSolver2 solver2 = new ClassicalSuperpositionSolver2(config1, Q, sources1, loads1);
//        solver2.solve();

//        System.out.println("=== КЛАССИЧЕСКИЙ МЕТОД СУПЕРПОЗИЦИИ ===");
//        System.out.println("Топология сети: " + networkConnections);
//        if (!disabledBranches.isEmpty()) {
//            System.out.println("Отключенные ветви: " + disabledBranches);
//        }
//        System.out.println("Всего узлов: " + allNodes.size());
//        System.out.println("=".repeat(60));

        Map<String, Double> totalBranchCurrents = new HashMap<>();

        // 1. Сначала определяем, какие источники могут обслуживать какие нагрузки
        Map<String, List<String>> sourceToLoads = new HashMap<>();
        Map<String, List<String>> loadToSources = new HashMap<>();

        for (Source source : sources) {
            sourceToLoads.put(source.node(), new ArrayList<>());
        }

        for (String loadNode : loads.keySet()) {
            loadToSources.put(loadNode, new ArrayList<>());
        }

        for (Source source : sources) {
            for (String loadNode : loads.keySet()) {
                List<List<String>> paths = findAllPaths(source.node(), loadNode);
                if (!paths.isEmpty()) {
                    sourceToLoads.get(source.node()).add(loadNode);
                    loadToSources.get(loadNode).add(source.node());
                }
            }
        }

        // 2. Распределяем нагрузки между источниками пропорционально их мощности
        Map<String, Map<String, Double>> sourceLoadAllocation = allocateLoadsToSources(sourceToLoads, loadToSources);

        // 3. РАСЧЕТ ДЛЯ КАЖДОГО ИСТОЧНИКА В ОТДЕЛЬНОСТИ
        for (int i = 0; i < sources.size(); i++) {
            Source source = sources.get(i);
            String sourceNode = source.node();
            double sourceCurrent = source.current();

//            System.out.printf("\n🔹 %d: ИСТОЧНИК %s (%.1fA)%n",
//                    i + 1, sourceNode, sourceCurrent);
//            System.out.println("-".repeat(40));

            // Получаем распределение нагрузок для этого источника
            Map<String, Double> allocatedLoads = sourceLoadAllocation.get(sourceNode);

//            if (allocatedLoads == null || allocatedLoads.isEmpty()) {
//                System.out.println("Источник не обслуживает никакие нагрузки");
//                continue;
//            }

            double totalAllocatedLoad = allocatedLoads.values().stream().mapToDouble(Double::doubleValue).sum();
            double actualSourceCurrent = Math.min(sourceCurrent, totalAllocatedLoad);

//            if (actualSourceCurrent < sourceCurrent) {
//                System.out.printf("⚠️  Источник ограничен: %.1fA -> %.1fA (по распределенным нагрузкам)%n",
//                        sourceCurrent, actualSourceCurrent);
//            } else {
//                System.out.printf("Источник работает на полную мощность: %.1fA%n", actualSourceCurrent);
//            }
//
//            System.out.printf("Обслуживает нагрузки: %s%n", allocatedLoads);
//            System.out.printf("Суммарная распределенная нагрузка: %.1fA%n", totalAllocatedLoad);

//            Map<String, Double> currentDistribution = new HashMap<>();
//            Map<String, Double> sourceContributions = calculateForSingleSourceWithAllocation(
//                    sourceNode, actualSourceCurrent, allocatedLoads, currentDistribution);
            Map<String, Double> sourceContributions = calculateForSingleSourceWithAllocation(
                    sourceNode, actualSourceCurrent, allocatedLoads);

            // Суммируем вклады (алгебраическая сумма)
            for (Map.Entry<String, Double> entry : sourceContributions.entrySet()) {
                String branch = entry.getKey();
                double current = entry.getValue();

                if (totalBranchCurrents.containsKey(branch)) {
                    totalBranchCurrents.put(branch, totalBranchCurrents.get(branch) + current);
                } else {
                    String[] parts = branch.split(" → ");
                    String reverseBranch = parts[1] + " → " + parts[0];
                    if (totalBranchCurrents.containsKey(reverseBranch)) {
                        totalBranchCurrents.put(reverseBranch, totalBranchCurrents.get(reverseBranch) - current);
                    } else {
                        totalBranchCurrents.put(branch, current);
//                        System.out.println();
                    }
                }
            }
        }

        // 4. Расчет физических токов с правильными направлениями
//        System.out.println("\n🔍 СУММАРНЫЕ ТОКИ ПО ФИЗИЧЕСКИМ ВЕТВЯМ:");
//        System.out.println("-".repeat(50));

        Map<String, Double> physicalBranchCurrents = new HashMap<>();

        for (Map.Entry<String, Double> entry : totalBranchCurrents.entrySet()) {
            String[] parts = entry.getKey().split(" → ");
            String fromNode = parts[0];
            String toNode = parts[1];
            double current = entry.getValue();

            // Получаем имя ветви
            String branchName = getBranchName(fromNode, toNode);

            // Пропускаем отключенные ветви (ток должен быть 0)
            if (disabledBranches.contains(branchName)) {
                continue;
            }

            if (current == 0) {
                physicalBranchCurrents.put(fromNode + " -- " + branchName + " -- " + toNode, current);
            } else if (current > 0) {
                physicalBranchCurrents.put(fromNode + " → " + branchName + " → " + toNode, current);
            } else {
                physicalBranchCurrents.put(toNode + " → " + branchName + " → " + fromNode, -current);
            }
        }

        // Добавляем отключенные ветви с нулевым током
        for (String disabledBranch : disabledBranches) {
            List<String> nodes = networkConnections.get(disabledBranch);
            if (nodes != null) {
                String physicalBranch = nodes.get(0) + " - " + disabledBranch + " - " + nodes.get(1);
                physicalBranchCurrents.putIfAbsent(physicalBranch, 0.0);
            }
        }

        // Выводим результаты в отсортированном порядке
        Map<String, Double> sortedMap = new TreeMap<>(Comparator.naturalOrder());
        sortedMap.putAll(physicalBranchCurrents);

//        sortedMap.forEach((key, value) -> {
//            System.out.println(key + " : " + value);
//        });

        // Выводим фактическое потребление нагрузок
//        System.out.println("\n📊 ФАКТИЧЕСКОЕ ПОТРЕБЛЕНИЕ НАГРУЗОК:");
//        System.out.println("-".repeat(40));

//        Map<String, Double> actualLoadConsumption = calculateActualLoadConsumption(totalBranchCurrents);
//        for (Map.Entry<String, Double> load : loads.entrySet()) {
//            String loadNode = load.getKey();
//            double required = load.getValue();
//            double actual = actualLoadConsumption.getOrDefault(loadNode, 0.0);
//            String status = Math.abs(actual - required) < 0.001 ? "✅" : "⚠️ ";
//            System.out.printf("%s Нагрузка %s: %.1fA из требуемых %.1fA%n",
//                    status, loadNode, actual, required);
//        }
        return sortedMap;
    }

    private Map<String, Map<String, Double>> allocateLoadsToSources(
            Map<String, List<String>> sourceToLoads,
            Map<String, List<String>> loadToSources) {

        Map<String, Map<String, Double>> allocation = new HashMap<>();
//        Map<String, Double> remainingLoads = new HashMap<>(loads);

        // Инициализируем распределение
        for (String sourceNode : sourceToLoads.keySet()) {
            allocation.put(sourceNode, new HashMap<>());
        }

        // Распределяем нагрузки пропорционально мощности источников, которые могут их обслуживать
        for (String loadNode : loads.keySet()) {
            double loadDemand = loads.get(loadNode);
            List<String> availableSources = loadToSources.get(loadNode);

//            if (availableSources.isEmpty()) {
//                System.out.printf("⚠️  Нагрузка %s не может быть обслужена (нет доступных источников)%n", loadNode);
//                continue;
//            }

            // Вычисляем суммарную мощность доступных источников для этой нагрузки
            double totalAvailablePower = 0;
            for (String sourceNode : availableSources) {
                Source source = findSource(sourceNode);
                if (source != null) {
                    totalAvailablePower += source.current();
                }
            }

            if (totalAvailablePower == 0) {
//                System.out.printf("⚠️  Нагрузка %s не может быть обслужена (источники имеют нулевую мощность)%n", loadNode);
                continue;
            }

            // Распределяем нагрузку пропорционально мощности источников
            for (String sourceNode : availableSources) {
                Source source = findSource(sourceNode);
                if (source != null) {
                    double sourceShare = source.current() / totalAvailablePower;
                    double allocatedLoad = loadDemand * sourceShare;
                    allocation.get(sourceNode).put(loadNode, allocatedLoad);
                }
            }
        }

        return allocation;
    }

    private Source findSource(String sourceNode) {
        for (Source source : sources) {
            if (source.node().equals(sourceNode)) {
                return source;
            }
        }
        return null;
    }

//    private Map<String, Double> calculateForSingleSourceWithAllocation(
//            String sourceNode, double sourceCurrent,
//            Map<String, Double> allocatedLoads,
//            Map<String, Double> currentDistribution) {

    private Map<String, Double> calculateForSingleSourceWithAllocation(
            String sourceNode, double sourceCurrent,
            Map<String, Double> allocatedLoads) {

        Map<String, Double> branchCurrents = new HashMap<>();

        double totalAllocatedLoad = allocatedLoads.values().stream().mapToDouble(Double::doubleValue).sum();

//        if (totalAllocatedLoad == 0) {
//            System.out.printf("Источник %s: нет распределенных нагрузок, ток не отдается%n", sourceNode);
//            return branchCurrents;
//        }

//        System.out.printf("Распределение тока %.1fA между назначенными нагрузками:%n", sourceCurrent);

        for (Map.Entry<String, Double> allocation : allocatedLoads.entrySet()) {
            String loadNode = allocation.getKey();
            double allocatedDemand = allocation.getValue();

            // Вычисляем, сколько тока должен отдать этот источник данной нагрузке
            double allocationShare = allocatedDemand / totalAllocatedLoad;
            double currentToLoad = sourceCurrent * allocationShare;

            // Ограничиваем максимальный ток требуемым значением нагрузки
            double loadRequired = loads.get(loadNode);
            currentToLoad = Math.min(currentToLoad, loadRequired);

//            currentDistribution.put(loadNode, currentToLoad);

//            System.out.printf("  → Нагрузка %s: %.1fA (распределено: %.1fA, требуется: %.1fA)%n",
//                    loadNode, currentToLoad, allocatedDemand, loadRequired);

            List<List<String>> allPaths = findAllPaths(sourceNode, loadNode);

            if (allPaths.isEmpty()) {
//                System.out.printf("    ⚠️  Нет доступных путей!%n");
                continue;
            }

            double currentPerPath = currentToLoad / allPaths.size();

//            System.out.printf("    Найдено путей: %d, по %.1fA на путь%n",
//                    allPaths.size(), currentPerPath);

//            for (int i = 0; i < allPaths.size(); i++) {
//                System.out.printf("      Путь %d: %s%n", i + 1, formatPath(allPaths.get(i)));
//            }
//System.exit(0);
            for (List<String> path : allPaths) {
                for (int j = 0; j < path.size() - 1; j++) {
                    String from = path.get(j);
                    String to = path.get(j + 1);
                    String branch = from + " → " + to;
                    branchCurrents.put(branch,
                            branchCurrents.getOrDefault(branch, 0.0) + currentPerPath);
                }
            }
//            System.out.println();
        }

        return branchCurrents;
    }

//    private Map<String, Double> calculateActualLoadConsumption(Map<String, Double> branchCurrents) {
//        Map<String, Double> loadConsumption = new HashMap<>();
//
//        // Для каждой нагрузки вычисляем входящий и исходящий ток
//        for (String loadNode : loads.keySet()) {
//            double netCurrent = 0;
//
//            // Суммируем токи во всех ветвях, подключенных к этому узлу
//            for (Map.Entry<String, Double> entry : branchCurrents.entrySet()) {
//                String[] parts = entry.getKey().split(" → ");
//                String fromNode = parts[0];
//                String toNode = parts[1];
//                double current = entry.getValue();
//
//                if (fromNode.equals(loadNode)) {
//                    netCurrent -= current; // ток уходит из узла
//                } else if (toNode.equals(loadNode)) {
//                    netCurrent += current; // ток приходит в узел
//                }
//            }
//
//            loadConsumption.put(loadNode, netCurrent);
//        }
//
//        return loadConsumption;
//    }

    private List<List<String>> findAllPaths(String start, String end) {
        List<List<String>> allPaths = new ArrayList<>();
        Map<String, Boolean> visited = new HashMap<>();
        for (String node : allNodes) {
            visited.put(node, false);
        }
        findPathsRecursive(start, end, new ArrayList<>(), visited, allPaths);
        return allPaths;
    }

    private void findPathsRecursive(String current, String end, List<String> currentPath,
                                    Map<String, Boolean> visited, List<List<String>> allPaths) {
        visited.put(current, true);
        currentPath.add(current);

        if (current.equals(end)) {
            allPaths.add(new ArrayList<>(currentPath));
        } else {
            // Ищем соединения для текущего узла в Map
            for (Map.Entry<String, List<String>> entry : networkConnections.entrySet()) {
                String branchName = entry.getKey();
                List<String> connection = entry.getValue();
                // Пропускаем отключенные ветви
                if (disabledBranches.contains(branchName)) {
                    continue;
                }

                String nextNode = null;

                if (connection.get(0).equals(current) && !visited.get(connection.get(1))) {
                    nextNode = connection.get(1);
                } else if (connection.get(1).equals(current) && !visited.get(connection.get(0))) {
                    nextNode = connection.get(0);
                }

                if (nextNode != null) {
                    findPathsRecursive(nextNode, end, currentPath, visited, allPaths);
                }
            }
        }

        currentPath.remove(currentPath.size() - 1);
        visited.put(current, false);
    }

    private String formatPath(List<String> path) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < path.size(); i++) {
            if (i > 0) {
                String from = path.get(i - 1);
                String to = path.get(i);
                String branchName = getBranchName(from, to);
                sb.append(" → ").append(branchName).append(" → ");
            }
            sb.append(path.get(i));
        }
        return sb.toString();
    }

    private String getBranchName(String node1, String node2) {
        for (Map.Entry<String, List<String>> entry : networkConnections.entrySet()) {
            List<String> nodes = entry.getValue();
            if ((nodes.get(0).equals(node1) && nodes.get(1).equals(node2)) ||
                    (nodes.get(0).equals(node2) && nodes.get(1).equals(node1))) {
                return entry.getKey();
            }
        }
        return "Unknown";
    }
}