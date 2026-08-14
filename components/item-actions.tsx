import { ThemedText } from "@/components/themed-text";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  title?: string;
};

export default function ItemActions({ visible, onClose, onEdit, onDelete, title }: Props) {
  const translate = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) {
      setConfirming(false);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translate, { toValue: 0, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translate.setValue(30);
      setConfirming(false);
    }
  }, [visible, opacity, translate]);

  const handleDeletePress = () => {
    setConfirming(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    onClose();
  };

  const handleEditPress = () => {
    onEdit();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <Animated.View style={[styles.card, { transform: [{ translateY: translate }], opacity }]}>
        {title ? <ThemedText style={styles.title}>{title}</ThemedText> : null}

        {!confirming ? (
          <>
            <Pressable style={styles.option} onPress={handleEditPress}>
              <ThemedText style={styles.optionText}>Edit</ThemedText>
            </Pressable>

            <Pressable style={[styles.option, styles.destructive]} onPress={handleDeletePress}>
              <ThemedText style={[styles.optionText, styles.destructiveText]}>Delete</ThemedText>
            </Pressable>

            <Pressable style={styles.cancel} onPress={onClose}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
          </>
        ) : (
          <>
            <ThemedText style={styles.confirmText}>Are you sure you want to delete this item?</ThemedText>
            <Pressable style={[styles.option, styles.destructive]} onPress={handleConfirmDelete}>
              <ThemedText style={[styles.optionText, styles.destructiveText]}>Yes, delete</ThemedText>
            </Pressable>
            <Pressable style={styles.cancel} onPress={() => setConfirming(false)}>
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 22,
    backgroundColor: "#171717",
    padding: 16,
    borderRadius: 14,
    borderColor: "#1f2937",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#111827",
  },
  optionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  destructive: {
    borderBottomWidth: 0,
  },
  destructiveText: {
    color: "#ef4444",
  },
  cancel: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#cbd5e1",
    fontSize: 15,
  },
  confirmText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginBottom: 10,
  },
});
