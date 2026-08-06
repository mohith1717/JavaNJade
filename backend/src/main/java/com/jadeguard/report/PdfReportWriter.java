package com.jadeguard.report;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

final class PdfReportWriter {
    private static final int LINES_PER_PAGE = 44;

    private PdfReportWriter() { }

    static byte[] write(List<String> input) {
        List<String> lines = input.isEmpty() ? List.of("No report data") : input;
        int pages = (lines.size() + LINES_PER_PAGE - 1) / LINES_PER_PAGE;
        int fontObject = 3 + pages * 2;
        int objectCount = fontObject;
        List<byte[]> objects = new ArrayList<>();
        objects.add(bytes("<< /Type /Catalog /Pages 2 0 R >>"));
        StringBuilder kids = new StringBuilder();
        for (int page = 0; page < pages; page++) kids.append(3 + page * 2).append(" 0 R ");
        objects.add(bytes("<< /Type /Pages /Kids [" + kids + "] /Count " + pages + " >>"));
        for (int page = 0; page < pages; page++) {
            int pageObject = 3 + page * 2;
            int contentObject = pageObject + 1;
            objects.add(bytes("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 " + fontObject + " 0 R >> >> /Contents " + contentObject + " 0 R >>"));
            String stream = content(lines.subList(page * LINES_PER_PAGE,
                    Math.min(lines.size(), (page + 1) * LINES_PER_PAGE)));
            byte[] streamBytes = bytes(stream);
            objects.add(bytes("<< /Length " + streamBytes.length + " >>\nstream\n" + stream + "\nendstream"));
        }
        objects.add(bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));

        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            output.write(bytes("%PDF-1.4\n%JadeGuard\n"));
            int[] offsets = new int[objectCount + 1];
            for (int index = 0; index < objects.size(); index++) {
                offsets[index + 1] = output.size();
                output.write(bytes((index + 1) + " 0 obj\n"));
                output.write(objects.get(index));
                output.write(bytes("\nendobj\n"));
            }
            int xref = output.size();
            output.write(bytes("xref\n0 " + (objectCount + 1) + "\n0000000000 65535 f \n"));
            for (int index = 1; index <= objectCount; index++) {
                output.write(bytes(String.format("%010d 00000 n \n", offsets[index])));
            }
            output.write(bytes("trailer\n<< /Size " + (objectCount + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF"));
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to generate PDF report", exception);
        }
    }

    private static String content(List<String> lines) {
        StringBuilder content = new StringBuilder("BT\n/F1 10 Tf\n45 755 Td\n");
        for (String line : lines) {
            content.append('(').append(escape(line)).append(") Tj\n0 -16 Td\n");
        }
        return content.append("ET").toString();
    }

    private static String escape(String value) {
        String ascii = value.replaceAll("[^\\x20-\\x7E]", "?");
        return ascii.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }

    private static byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.ISO_8859_1);
    }
}
