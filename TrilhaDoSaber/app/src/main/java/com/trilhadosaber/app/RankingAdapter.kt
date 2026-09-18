package com.trilhadosaber.app

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.card.MaterialCardView
import com.trilhadosaber.app.model.RankingEntry

class RankingAdapter(private val entries: List<RankingEntry>) :
    RecyclerView.Adapter<RankingAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val card: MaterialCardView = view.findViewById(R.id.cardRankingItem)
        val tvRankPosition: TextView = view.findViewById(R.id.tvRankPosition)
        val tvRankName: TextView = view.findViewById(R.id.tvRankName)
        val tvRankGrade: TextView = view.findViewById(R.id.tvRankGrade)
        val tvRankXp: TextView = view.findViewById(R.id.tvRankXp)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_ranking, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = entries[position]
        val context = holder.itemView.context

        holder.tvRankPosition.text = "${item.rank}º"
        holder.tvRankName.text = item.name + if (item.isCurrentUser) " (Você)" else ""
        holder.tvRankGrade.text = item.grade
        holder.tvRankXp.text = "${item.xp} XP"

        // Medal distinction for top 3
        when (item.rank) {
            1 -> {
                holder.tvRankPosition.text = "🥇"
                holder.tvRankPosition.textSize = 20f
                holder.tvRankPosition.setBackgroundResource(R.drawable.bg_option_selected)
            }
            2 -> {
                holder.tvRankPosition.text = "🥈"
                holder.tvRankPosition.textSize = 20f
                holder.tvRankPosition.setBackgroundResource(R.drawable.bg_option_selected)
            }
            3 -> {
                holder.tvRankPosition.text = "🥉"
                holder.tvRankPosition.textSize = 20f
                holder.tvRankPosition.setBackgroundResource(R.drawable.bg_option_selected)
            }
            else -> {
                holder.tvRankPosition.text = "${item.rank}º"
                holder.tvRankPosition.textSize = 14f
                holder.tvRankPosition.setBackgroundResource(R.drawable.bg_option_default)
            }
        }

        if (item.isCurrentUser) {
            holder.card.strokeColor = ContextCompat.getColor(context, R.color.colorPrimary)
            holder.card.strokeWidth = 3
            holder.card.setCardBackgroundColor(ContextCompat.getColor(context, R.color.colorPrimaryLight))
        } else {
            holder.card.strokeColor = ContextCompat.getColor(context, R.color.cardBorder)
            holder.card.strokeWidth = 2
            holder.card.setCardBackgroundColor(ContextCompat.getColor(context, R.color.surfaceCard))
        }
    }

    override fun getItemCount(): Int = entries.size
}
